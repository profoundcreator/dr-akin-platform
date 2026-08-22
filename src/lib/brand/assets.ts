import { SITE_IMAGES } from "@/lib/media/site-images";

/** Canonical brand asset paths (public/brand/). */
export const BRAND_ASSETS = {
  /** Wordmark for light site backgrounds (header/footer). */
  wordmarkLight: "/brand/akin-wordmark-light.png",
  /** Notification emails — light mode (transparent, dark glyphs). */
  wordmarkEmailLight: "/brand/akin-wordmark-email-light.png",
  /** Notification emails — dark mode (transparent, light glyphs). */
  wordmarkEmailDark: "/brand/akin-wordmark-email-dark.png",
  /** Legacy monochrome lockup (superseded by wordmarkLight when imported). */
  wordmarkMonoLegacy: "/brand/akin-logo-mono.png",
  /** Full-colour lockup — use on dark surfaces or marketing only. */
  wordmarkColor: "/brand/akin-logo-color.png",
  iconmark: "/brand/akin-iconmark.png",
  favicon: "/favicon.svg",
  appleTouchIcon: "/brand/akin-iconmark.png",
  defaultSocialImage: SITE_IMAGES.socialOg,
} as const;

export function getBrandAsset(
  asset: keyof typeof BRAND_ASSETS,
  fallback?: string,
): string | undefined {
  return BRAND_ASSETS[asset] ?? fallback;
}
