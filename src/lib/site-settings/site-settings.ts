import { tryGetSupabaseClient } from "@/lib/supabase/client";
import type { DbSiteSettings, HomepageHeroMode } from "@/lib/supabase/database.types";
import { formatSchemaSetupError, isMissingPhase1SchemaError } from "@/lib/site-settings/schema-support";

export interface SiteSettings {
  homepageEventsEnabled: boolean;
  homepageHeroMode: HomepageHeroMode;
  homepageBannerImagePath: string | null;
  homepagePortraitImagePath: string | null;
  updatedAt: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  homepageEventsEnabled: true,
  homepageHeroMode: "portrait",
  homepageBannerImagePath: null,
  homepagePortraitImagePath: null,
  updatedAt: new Date(0).toISOString(),
};

function mapRow(row: DbSiteSettings): SiteSettings {
  return {
    homepageEventsEnabled: row.homepage_events_enabled,
    homepageHeroMode: row.homepage_hero_mode,
    homepageBannerImagePath: row.homepage_banner_image_path,
    homepagePortraitImagePath: row.homepage_portrait_image_path,
    updatedAt: row.updated_at,
  };
}

export function getHomepageAssetUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/homepage-assets/${path}`;
}

export async function getPublicSiteSettings(): Promise<SiteSettings> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return DEFAULT_SITE_SETTINGS;

  const { data, error } = await supabase.from("site_settings").select("*").eq("id", true).maybeSingle();

  if (error) {
    if (isMissingPhase1SchemaError(error.message)) return DEFAULT_SITE_SETTINGS;
    return DEFAULT_SITE_SETTINGS;
  }
  if (!data) return DEFAULT_SITE_SETTINGS;
  return mapRow(data);
}

export async function getAdminSiteSettings(): Promise<SiteSettings> {
  return getPublicSiteSettings();
}

export async function isPhase1SchemaReady(): Promise<boolean> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from("site_settings").select("id").eq("id", true).maybeSingle();
  return !error;
}

export interface SiteSettingsInput {
  homepageEventsEnabled: boolean;
  homepageHeroMode: HomepageHeroMode;
  homepageBannerImagePath?: string | null;
  homepagePortraitImagePath?: string | null;
}

export async function updateSiteSettings(
  input: SiteSettingsInput,
  updatedBy?: string,
): Promise<SiteSettings> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("site_settings")
    .upsert({
      id: true,
      homepage_events_enabled: input.homepageEventsEnabled,
      homepage_hero_mode: input.homepageHeroMode,
      homepage_banner_image_path: input.homepageBannerImagePath ?? null,
      homepage_portrait_image_path: input.homepagePortraitImagePath ?? null,
      updated_by: updatedBy ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return mapRow(data);
}
