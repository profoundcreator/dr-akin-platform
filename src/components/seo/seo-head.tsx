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
  ogImage = "/images/dr-akin-portrait.svg",
}: SeoProps) {
  return {
    title,
    description,
    canonical,
    ogImage,
  };
}
