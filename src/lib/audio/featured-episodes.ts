import { isSupabaseConfigured, tryGetSupabaseClient } from "@/lib/supabase/client";
import type { DbFeaturedPodcastEpisode } from "@/lib/supabase/database.types";

export interface FeaturedPodcastEpisode {
  id: string;
  title: string;
  description: string | null;
  spotifyUrl: string;
  episodeDate: string | null;
  durationLabel: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturedEpisodeInput {
  title: string;
  description?: string;
  spotifyUrl: string;
  episodeDate?: string;
  durationLabel?: string;
  sortOrder?: number;
  isPublished?: boolean;
}

function mapRow(row: DbFeaturedPodcastEpisode): FeaturedPodcastEpisode {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    spotifyUrl: row.spotify_url,
    episodeDate: row.episode_date,
    durationLabel: row.duration_label,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPublishedFeaturedEpisodes(): Promise<FeaturedPodcastEpisode[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("featured_podcast_episodes")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function getAdminFeaturedEpisodes(): Promise<FeaturedPodcastEpisode[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("featured_podcast_episodes")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function createFeaturedEpisode(
  input: FeaturedEpisodeInput,
  createdBy?: string,
): Promise<FeaturedPodcastEpisode> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("featured_podcast_episodes")
    .insert({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      spotify_url: input.spotifyUrl.trim(),
      episode_date: input.episodeDate?.trim() || null,
      duration_label: input.durationLabel?.trim() || null,
      sort_order: input.sortOrder ?? 0,
      is_published: input.isPublished ?? true,
      created_by: createdBy ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function updateFeaturedEpisode(
  id: string,
  input: Partial<FeaturedEpisodeInput>,
): Promise<FeaturedPodcastEpisode> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.description !== undefined) payload.description = input.description.trim() || null;
  if (input.spotifyUrl !== undefined) payload.spotify_url = input.spotifyUrl.trim();
  if (input.episodeDate !== undefined) payload.episode_date = input.episodeDate.trim() || null;
  if (input.durationLabel !== undefined) payload.duration_label = input.durationLabel.trim() || null;
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
  if (input.isPublished !== undefined) payload.is_published = input.isPublished;

  const { data, error } = await supabase
    .from("featured_podcast_episodes")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function deleteFeaturedEpisode(id: string): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("featured_podcast_episodes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function isValidSpotifyEpisodeUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.hostname.includes("spotify.com") && parsed.pathname.includes("/episode/");
  } catch {
    return false;
  }
}
