export const INSIGHT_CATEGORIES = [
  "Corporate Transformation",
  "Executive Coaching",
  "Leadership",
  "Strategy",
] as const;

export type InsightCategory = (typeof INSIGHT_CATEGORIES)[number];

export const INSIGHT_STATUS_LABELS = {
  draft: "Draft",
  pending_approval: "Pending approval",
  published: "Published",
  hidden: "Hidden",
} as const;

export const MAX_HOMEPAGE_FEATURED_INSIGHTS = 3;

export const INSIGHT_HERO_IMAGE_HINT =
  "Optional editorial header. Best: 1600×900 px (16:9), JPG or WebP, under 6 MB. Remove to publish without a cover image.";

export const MIGRATION_014_HINT =
  "Run supabase/migrations/014_insight_hero_images.sql in the Supabase SQL Editor, then refresh.";
