import { SITE_IMAGES } from "@/lib/media/site-images";

export interface SeoProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}

export function buildSeoMeta({
  title,
  description,
  canonical,
  ogImage = SITE_IMAGES.portraitFormal,
}: SeoProps) {
  return {
    title,
    description,
    canonical,
    ogImage,
  };
}
