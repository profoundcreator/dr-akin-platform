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

export const MIGRATION_010_HINT =
  "Run supabase/migrations/010_insights_articles.sql in the Supabase SQL Editor, then refresh.";
