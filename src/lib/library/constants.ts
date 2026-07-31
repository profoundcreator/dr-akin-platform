export const BOOK_CATEGORIES = [
  "Marketplace Ministry",
  "High Performance",
  "Academic Excellence",
] as const;

export type BookCategory = (typeof BOOK_CATEGORIES)[number];

export const LIBRARY_BOOK_STATUS_LABELS = {
  draft: "Draft",
  pending_approval: "Pending approval",
  published: "Published",
  hidden: "Hidden",
} as const;

export const BOOK_COVER_IMAGE_HINT =
  "Best results: 1200×1800 px (2:3 book cover), JPG or WebP, under 6 MB. Keep text away from edges.";

export const MIGRATION_009_HINT =
  "Run supabase/migrations/009_library_books.sql in the Supabase SQL Editor, then refresh.";
