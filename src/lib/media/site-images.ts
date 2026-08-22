/** Standard Open Graph / Twitter card dimensions. */
export const SOCIAL_OG_IMAGE = { width: 1200, height: 630 } as const;

/** Self-hosted marketing assets (formerly on storage.googleapis.com/ployai). */
export const SITE_IMAGES = {
  /** Homepage hero — unchanged until client approves swap. */
  portrait: "/images/marketing/dr-akin-portrait.webp",
  /** Formal studio portrait (blue suit) — profile hero. */
  portraitFormal: "/images/marketing/dr-akin-portrait-formal.webp",
  /** Approachable studio portrait (navy suit) — Meet hub + Work hub. */
  portraitApproachable: "/images/marketing/dr-akin-portrait-approachable.webp",
  /** Default link-preview card — stage side profile (1200×630 JPEG). */
  socialOg: "/images/marketing/dr-akin-social-og.jpg",
  /** Speaking page OG — keynote on stage with theme screen. */
  speakingOg: "/images/marketing/dr-akin-speaking-og.jpg",
  /** Speaking page in-browser hero — wide hall shot. */
  speakingHero: "/images/marketing/dr-akin-speaking-hero.webp",
  /** PerformX Summit 2026 event cover / OG. */
  performxSummitOg: "/images/marketing/performx-summit-og.jpg",
  ecosystemVisual: "/images/marketing/ecosystem-visual.webp",
  books: {
    "the-agenda": "/images/marketing/books/the-agenda.webp",
    "called-but-missing": "/images/marketing/books/called-but-missing.webp",
    "from-the-streets-to-forbes": "/images/marketing/books/from-the-streets-to-forbes.webp",
    "networking-your-way-to-the-top": "/images/marketing/books/networking-your-way-to-the-top.webp",
    "stay-in-your-process": "/images/marketing/books/stay-in-your-process.webp",
    "not-guilty": "/images/marketing/books/not-guilty.webp",
    dominion: "/images/marketing/books/dominion.webp",
    "the-seven-star-student": "/images/marketing/books/the-seven-star-student.webp",
    "the-seven-star-teacher": "/images/marketing/books/the-seven-star-teacher.webp",
  },
} as const;
