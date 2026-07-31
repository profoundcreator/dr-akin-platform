import { tryGetSupabaseClient } from "@/lib/supabase/client";
import { formatSchemaSetupError, isMissingPhase6SchemaError } from "@/lib/site-settings/schema-support";

export interface PreloadedContentSettings {
  hiddenInsightSlugs: string[];
  hiddenBookSlugs: string[];
}

export const EMPTY_PRELOADED_CONTENT_SETTINGS: PreloadedContentSettings = {
  hiddenInsightSlugs: [],
  hiddenBookSlugs: [],
};

function normalizeSlugs(slugs: string[] | null | undefined): string[] {
  return [...new Set((slugs ?? []).map((slug) => slug.trim().toLowerCase()).filter(Boolean))];
}

function mapRow(row: {
  hidden_preloaded_insight_slugs?: string[] | null;
  hidden_preloaded_book_slugs?: string[] | null;
}): PreloadedContentSettings {
  return {
    hiddenInsightSlugs: normalizeSlugs(row.hidden_preloaded_insight_slugs),
    hiddenBookSlugs: normalizeSlugs(row.hidden_preloaded_book_slugs),
  };
}

export async function isPreloadedContentSchemaReady(): Promise<boolean> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("site_settings")
    .select("hidden_preloaded_insight_slugs, hidden_preloaded_book_slugs")
    .eq("id", true)
    .maybeSingle();

  return !error;
}

export async function getPreloadedContentSettings(): Promise<PreloadedContentSettings> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return EMPTY_PRELOADED_CONTENT_SETTINGS;

  const { data, error } = await supabase
    .from("site_settings")
    .select("hidden_preloaded_insight_slugs, hidden_preloaded_book_slugs")
    .eq("id", true)
    .maybeSingle();

  if (error || !data) {
    if (error && isMissingPhase6SchemaError(error.message)) {
      return EMPTY_PRELOADED_CONTENT_SETTINGS;
    }
    return EMPTY_PRELOADED_CONTENT_SETTINGS;
  }

  return mapRow(data);
}

async function updateHiddenSlugs(
  field: "hidden_preloaded_insight_slugs" | "hidden_preloaded_book_slugs",
  slugs: string[],
  updatedBy?: string,
): Promise<PreloadedContentSettings> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("site_settings")
    .update({
      [field]: normalizeSlugs(slugs),
      updated_by: updatedBy ?? null,
    })
    .eq("id", true)
    .select("hidden_preloaded_insight_slugs, hidden_preloaded_book_slugs")
    .single();

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return mapRow(data);
}

export async function hidePreloadedInsight(slug: string, updatedBy?: string): Promise<void> {
  const settings = await getPreloadedContentSettings();
  const normalized = slug.trim().toLowerCase();
  if (settings.hiddenInsightSlugs.includes(normalized)) return;

  await updateHiddenSlugs(
    "hidden_preloaded_insight_slugs",
    [...settings.hiddenInsightSlugs, normalized],
    updatedBy,
  );
}

export async function restorePreloadedInsight(slug: string, updatedBy?: string): Promise<void> {
  const settings = await getPreloadedContentSettings();
  const normalized = slug.trim().toLowerCase();

  await updateHiddenSlugs(
    "hidden_preloaded_insight_slugs",
    settings.hiddenInsightSlugs.filter((item) => item !== normalized),
    updatedBy,
  );
}

export async function hidePreloadedBook(slug: string, updatedBy?: string): Promise<void> {
  const settings = await getPreloadedContentSettings();
  const normalized = slug.trim().toLowerCase();
  if (settings.hiddenBookSlugs.includes(normalized)) return;

  await updateHiddenSlugs(
    "hidden_preloaded_book_slugs",
    [...settings.hiddenBookSlugs, normalized],
    updatedBy,
  );
}

export async function restorePreloadedBook(slug: string, updatedBy?: string): Promise<void> {
  const settings = await getPreloadedContentSettings();
  const normalized = slug.trim().toLowerCase();

  await updateHiddenSlugs(
    "hidden_preloaded_book_slugs",
    settings.hiddenBookSlugs.filter((item) => item !== normalized),
    updatedBy,
  );
}

export async function fetchPreloadedContentSettingsForBuild(): Promise<PreloadedContentSettings> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !supabaseAnonKey) return EMPTY_PRELOADED_CONTENT_SETTINGS;

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?id=eq.true&select=hidden_preloaded_insight_slugs,hidden_preloaded_book_slugs`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      },
    );

    if (!response.ok) return EMPTY_PRELOADED_CONTENT_SETTINGS;
    const rows = (await response.json()) as Array<{
      hidden_preloaded_insight_slugs?: string[] | null;
      hidden_preloaded_book_slugs?: string[] | null;
    }>;
    return rows[0] ? mapRow(rows[0]) : EMPTY_PRELOADED_CONTENT_SETTINGS;
  } catch {
    return EMPTY_PRELOADED_CONTENT_SETTINGS;
  }
}
