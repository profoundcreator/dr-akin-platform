export const MIGRATION_007_HINT =
  "Run supabase/migrations/007_site_settings.sql in the Supabase SQL Editor, then refresh.";

export const MIGRATION_009_HINT =
  "Run supabase/migrations/009_library_books.sql in the Supabase SQL Editor, then refresh.";

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

export function formatSchemaSetupError(message: string): string {
  if (isMissingPhase1SchemaError(message)) {
    return `${message} ${MIGRATION_007_HINT}`;
  }
  if (isMissingPhase2SchemaError(message)) {
    return `${message} ${MIGRATION_009_HINT}`;
  }
  return message;
}
