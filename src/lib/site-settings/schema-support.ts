export const MIGRATION_007_HINT =
  "Run supabase/migrations/007_site_settings.sql in the Supabase SQL Editor, then refresh.";

export function isMissingPhase1SchemaError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("is_homepage_featured") ||
    normalized.includes("site_settings") ||
    normalized.includes("homepage-assets")
  );
}

export function formatSchemaSetupError(message: string): string {
  if (isMissingPhase1SchemaError(message)) {
    return `${message} ${MIGRATION_007_HINT}`;
  }
  return message;
}
