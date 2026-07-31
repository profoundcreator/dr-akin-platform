export const EVENT_COVER_IMAGE_HINT =
  "Best results: 1600×900 px (16:9), JPG or WebP, under 5 MB. Wider images crop cleanly on mobile.";

export const HOMEPAGE_BANNER_IMAGE_HINT =
  "Best results: 2400×1000 px (wide banner), JPG or WebP, under 6 MB. Used full-width at the top of the homepage.";

export const HOMEPAGE_PORTRAIT_IMAGE_HINT =
  "Best results: 1200×1500 px (4:5 portrait), JPG or WebP, under 6 MB. Shown in the hero beside the headline.";

export type HomepageHeroMode = "portrait" | "banner" | "minimal";

export const HOMEPAGE_HERO_MODE_OPTIONS: { value: HomepageHeroMode; label: string; description: string }[] =
  [
    {
      value: "portrait",
      label: "Portrait",
      description: "Headline with Dr. Akin portrait on the right (current default).",
    },
    {
      value: "banner",
      label: "Full-width banner",
      description: "Wide image across the top, then headline below.",
    },
    {
      value: "minimal",
      label: "Minimal",
      description: "Headline only — no hero image.",
    },
  ];

export const DEFAULT_PORTRAIT_URL =
  "https://storage.googleapis.com/ployai/3b0be71c-40e9-45e5-9330-d6975465f3c2/user/75ad6227-slurp-3ed01cc3-akin-akinpelu-burgundy-suit-portrait.webp";
