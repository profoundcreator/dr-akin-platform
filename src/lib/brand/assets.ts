import { SITE_IMAGES } from "@/lib/media/site-images";

/** Canonical brand asset paths (public/brand/). */
export const BRAND_ASSETS = {
  /** Monochrome lockup for light site backgrounds (header/footer). */
  wordmarkLight: "/brand/akin-logo-mono.png",
  /** Full-colour lockup — use on dark surfaces or marketing only. */
  wordmarkColor: "/brand/akin-logo-color.png",
  iconmark: "/brand/akin-iconmark.png",
  favicon: "/favicon.svg",
  appleTouchIcon: "/brand/akin-iconmark.png",
  defaultSocialImage: SITE_IMAGES.portrait,
} as const;

export function getBrandAsset(
  asset: keyof typeof BRAND_ASSETS,
  fallback?: string,
): string | undefined {
  return BRAND_ASSETS[asset] ?? fallback;
}
