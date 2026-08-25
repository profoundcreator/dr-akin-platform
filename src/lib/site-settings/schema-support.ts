export const MIGRATION_007_HINT =
  "Run supabase/migrations/007_site_settings.sql in the Supabase SQL Editor, then refresh.";

export const MIGRATION_009_HINT =
  "Run supabase/migrations/009_library_books.sql in the Supabase SQL Editor, then refresh.";

export const MIGRATION_010_HINT =
  "Run supabase/migrations/010_insights_articles.sql in the Supabase SQL Editor, then refresh.";

export const MIGRATION_011_HINT =
  "Run supabase/migrations/011_work_orgs.sql in the Supabase SQL Editor, then refresh.";

export const MIGRATION_012_HINT =
  "Run supabase/migrations/012_team_admin.sql in the Supabase SQL Editor, then refresh.";

export const MIGRATION_013_HINT =
  "Run supabase/migrations/013_preloaded_content_controls.sql in the Supabase SQL Editor, then refresh.";

export function isMissingPhase1SchemaError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("is_homepage_featured") ||
    normalized.includes("site_settings") ||
    normalized.includes("homepage-assets")
  );
}

export function isMissingPhase2SchemaError(message: string): boolean {
  return message.toLowerCase().includes("library_books") || message.toLowerCase().includes("book-covers");
}

export function isMissingPhase3SchemaError(message: string): boolean {
  return message.toLowerCase().includes("insights_articles");
}

export function isMissingPhase3MediaSchemaError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("hero_image_path") || normalized.includes("source_label");
}

export function isMissingPhase4SchemaError(message: string): boolean {
  return (
    message.toLowerCase().includes("work_orgs") ||
    message.toLowerCase().includes("work-org-assets")
  );
}

export function isMissingPhase5SchemaError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("is_founder") ||
    normalized.includes("update_admin_team_member") ||
    normalized.includes("mark_admin_as_founder")
  );
}

export const MIGRATION_035_HINT =
  "Run supabase/migrations/035_optional_image_hidden_flags.sql in the Supabase SQL Editor, then refresh.";

export function isMissingPhase7SchemaError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("hero_image_hidden") ||
    normalized.includes("cover_image_hidden") ||
    normalized.includes("homepage_banner_hidden") ||
    normalized.includes("homepage_portrait_hidden")
  );
}

export function isMissingPhase6SchemaError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("hidden_preloaded_insight_slugs") ||
    normalized.includes("hidden_preloaded_book_slugs")
  );
}

export function isPhase5SchemaError(message: string): boolean {
  return isMissingPhase5SchemaError(message);
}

export function formatSchemaSetupError(message: string): string {
  if (isMissingPhase1SchemaError(message)) {
    return `${message} ${MIGRATION_007_HINT}`;
  }
  if (isMissingPhase2SchemaError(message)) {
    return `${message} ${MIGRATION_009_HINT}`;
  }
  if (isMissingPhase3SchemaError(message)) {
    return `${message} ${MIGRATION_010_HINT}`;
  }
  if (isMissingPhase3MediaSchemaError(message)) {
    return `${message} Run supabase/migrations/014_insight_hero_images.sql in the Supabase SQL Editor, then refresh.`;
  }
  if (isMissingPhase4SchemaError(message)) {
    return `${message} ${MIGRATION_011_HINT}`;
  }
  if (isMissingPhase5SchemaError(message)) {
    return `${message} ${MIGRATION_012_HINT}`;
  }
  if (isMissingPhase6SchemaError(message)) {
    return `${message} ${MIGRATION_013_HINT}`;
  }
  if (isMissingPhase7SchemaError(message)) {
    return `${message} ${MIGRATION_035_HINT}`;
  }
  return message;
}
