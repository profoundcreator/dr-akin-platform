"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Headphones, Plus, Trash2 } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/context/admin-auth-provider";
import {
  createFeaturedEpisode,
  deleteFeaturedEpisode,
  getAdminFeaturedEpisodes,
  isValidSpotifyEpisodeUrl,
  updateFeaturedEpisode,
  type FeaturedPodcastEpisode,
} from "@/lib/audio/featured-episodes";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const EMPTY_FORM = {
  title: "",
  description: "",
  spotifyUrl: "",
  episodeDate: "",
  durationLabel: "",
  sortOrder: "0",
  isPublished: true,
};

export function FeaturedEpisodesDashboard() {
  const { profile } = useAdminAuth();
  const [episodes, setEpisodes] = useState<FeaturedPodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function loadEpisodes() {
    try {
      setError(null);
      setEpisodes(await getAdminFeaturedEpisodes());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load episodes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEpisodes();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Episode title is required.");
      return;
    }

    if (!isValidSpotifyEpisodeUrl(form.spotifyUrl)) {
      setError("Use a Spotify episode link (must include /episode/ in the URL).");
      return;
    }

    setSaving(true);
    try {
      await createFeaturedEpisode(
        {
          title: form.title,
          description: form.description,
          spotifyUrl: form.spotifyUrl,
          episodeDate: form.episodeDate,
          durationLabel: form.durationLabel,
          sortOrder: Number(form.sortOrder) || 0,
          isPublished: form.isPublished,
        },
        profile?.id,
      );
      setForm(EMPTY_FORM);
      await loadEpisodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save episode");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(episode: FeaturedPodcastEpisode) {
    try {
      await updateFeaturedEpisode(episode.id, { isPublished: !episode.isPublished });
      await loadEpisodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update episode");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remove this featured episode from the public page?")) return;
    try {
      await deleteFeaturedEpisode(id);
      await loadEpisodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete episode");
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <AdminLayoutShell title="Featured Episodes" subtitle="Audio Archives · The Kingdom Catalyst">
        <p className="ploy-surface-elevated p-6 text-sm text-[var(--ploy-text-secondary)]">
          Connect Supabase to manage featured podcast episodes. Public visitors will still see the
          Spotify embed on <a href="/resources/audio" className="underline">/resources/audio</a>.
        </p>
      </AdminLayoutShell>
    );
  }

  return (
    <AdminLayoutShell
      title="Featured Episodes"
      subtitle="Manage episodes shown on the public Audio Archives page"
    >
      {error && (
        <p className="mb-4 rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-4 py-3 text-sm text-[var(--ploy-status-error)]">
          {error}
        </p>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form onSubmit={handleSubmit} className="ploy-surface-elevated space-y-5 p-6">
          <div className="flex items-center gap-2">
            <Plus className="size-4 text-[var(--ploy-accent-primary)]" />
            <h2 className="text-lg font-semibold">Add featured episode</h2>
          </div>

          <div className="space-y-2">
            <Label htmlFor="episode-title" required>
              Episode title
            </Label>
            <Input
              id="episode-title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Episode title as it should appear on the site"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="episode-url" required>
              Spotify episode link
            </Label>
            <Input
              id="episode-url"
              value={form.spotifyUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, spotifyUrl: e.target.value }))}
              placeholder="https://open.spotify.com/episode/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="episode-description">Short description</Label>
            <textarea
              id="episode-description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm"
              placeholder="Optional summary for the public page"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="episode-date">Date label</Label>
              <Input
                id="episode-date"
                value={form.episodeDate}
                onChange={(e) => setForm((prev) => ({ ...prev, episodeDate: e.target.value }))}
                placeholder="e.g. 15 March 2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="episode-duration">Duration label</Label>
              <Input
                id="episode-duration"
                value={form.durationLabel}
                onChange={(e) => setForm((prev) => ({ ...prev, durationLabel: e.target.value }))}
                placeholder="e.g. 42 min"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="episode-sort">Sort order</Label>
              <Input
                id="episode-sort"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-3 pt-8 text-sm">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
              />
              Published on public page
            </label>
          </div>

          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving..." : "Add episode"}
          </Button>
        </form>

        <div className="ploy-surface-elevated space-y-6 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Headphones className="size-4 text-[var(--ploy-accent-primary)]" />
              <h2 className="text-lg font-semibold">Current featured episodes</h2>
            </div>
            <a
              href="/resources/audio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
            >
              View public page
              <ArrowUpRight className="size-4" />
            </a>
          </div>

          {loading ? (
            <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading episodes...</p>
          ) : episodes.length === 0 ? (
            <p className="text-sm text-[var(--ploy-text-secondary)]">
              No featured episodes yet. Add one using the form — visitors will see them on the
              Audio Archives page below the Spotify player.
            </p>
          ) : (
            <ul className="space-y-4">
              {episodes.map((episode) => (
                <li
                  key={episode.id}
                  className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium">{episode.title}</p>
                      <p className="text-xs text-[var(--ploy-text-tertiary)]">
                        Sort {episode.sortOrder}
                        {episode.episodeDate ? ` · ${episode.episodeDate}` : ""}
                        {episode.durationLabel ? ` · ${episode.durationLabel}` : ""}
                        {episode.isPublished ? " · Published" : " · Hidden"}
                      </p>
                      {episode.description && (
                        <p className="text-sm text-[var(--ploy-text-secondary)]">{episode.description}</p>
                      )}
                      <a
                        href={episode.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm underline underline-offset-4"
                      >
                        Open on Spotify
                        <ArrowUpRight className="size-3.5" />
                      </a>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => togglePublished(episode)}
                      >
                        {episode.isPublished ? "Hide" : "Publish"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(episode.id)}
                      >
                        <Trash2 className="size-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayoutShell>
  );
}
