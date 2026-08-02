import { SITE_IMAGES } from "@/lib/media/site-images";

export const BRAND_ASSETS = {
  wordmark: null,
  iconmark: null,
  favicon: "/favicon.svg",
  defaultSocialImage: SITE_IMAGES.portrait,
} as const;

export function getBrandAsset(
  asset: keyof typeof BRAND_ASSETS,
  fallback?: string,
): string | undefined {
  return BRAND_ASSETS[asset] ?? fallback;
}
