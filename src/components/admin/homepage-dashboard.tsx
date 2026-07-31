"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Home, ImagePlus, Save } from "lucide-react";
import { AdminSetupNotice } from "@/components/admin/admin-setup-notice";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { Button } from "@/components/ui/button";
import { ImageUploadHint } from "@/components/ui/image-upload-hint";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/context/admin-auth-provider";
import { canManageHomepage } from "@/lib/auth/permissions";
import {
  DEFAULT_PORTRAIT_URL,
  HOMEPAGE_BANNER_IMAGE_HINT,
  HOMEPAGE_HERO_MODE_OPTIONS,
  HOMEPAGE_PORTRAIT_IMAGE_HINT,
} from "@/lib/site-settings/constants";
import { uploadHomepageAsset } from "@/lib/site-settings/homepage-upload";
import {
  getAdminSiteSettings,
  getHomepageAssetUrl,
  isPhase1SchemaReady,
  updateSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings/site-settings";
import type { HomepageHeroMode } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function HomepageDashboard() {
  const { profile } = useAdminAuth();
  const canEdit = canManageHomepage(profile);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [homepageEventsEnabled, setHomepageEventsEnabled] = useState(true);
  const [homepageHeroMode, setHomepageHeroMode] = useState<HomepageHeroMode>("portrait");
  const [bannerPath, setBannerPath] = useState<string | null>(null);
  const [portraitPath, setPortraitPath] = useState<string | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);

  async function loadSettings() {
    try {
      setError(null);
      setSchemaReady(await isPhase1SchemaReady());
      const data = await getAdminSiteSettings();
      setSettings(data);
      setHomepageEventsEnabled(data.homepageEventsEnabled);
      setHomepageHeroMode(data.homepageHeroMode);
      setBannerPath(data.homepageBannerImagePath);
      setPortraitPath(data.homepagePortraitImagePath);
      setBannerPreview(getHomepageAssetUrl(data.homepageBannerImagePath));
      setPortraitPreview(getHomepageAssetUrl(data.homepagePortraitImagePath) ?? DEFAULT_PORTRAIT_URL);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load homepage settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      let nextBannerPath = bannerPath;
      let nextPortraitPath = portraitPath;

      if (bannerFile) {
        nextBannerPath = await uploadHomepageAsset(bannerFile, "banner");
      }
      if (portraitFile) {
        nextPortraitPath = await uploadHomepageAsset(portraitFile, "portrait");
      }

      const updated = await updateSiteSettings(
        {
          homepageEventsEnabled,
          homepageHeroMode,
          homepageBannerImagePath: nextBannerPath,
          homepagePortraitImagePath: nextPortraitPath,
        },
        profile?.id,
      );

      setSettings(updated);
      setBannerPath(updated.homepageBannerImagePath);
      setPortraitPath(updated.homepagePortraitImagePath);
      setBannerFile(null);
      setPortraitFile(null);
      setBannerPreview(getHomepageAssetUrl(updated.homepageBannerImagePath));
      setPortraitPreview(
        getHomepageAssetUrl(updated.homepagePortraitImagePath) ?? DEFAULT_PORTRAIT_URL,
      );
      setNotice("Homepage settings saved. Changes appear on the public site immediately.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save homepage settings");
    } finally {
      setSaving(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <AdminLayoutShell title="Homepage" subtitle="Hero banner and section visibility">
        <p className="ploy-surface-elevated p-6 text-sm text-[var(--ploy-text-secondary)]">
          Connect Supabase to manage homepage settings.
        </p>
      </AdminLayoutShell>
    );
  }

  return (
    <AdminLayoutShell title="Homepage" subtitle="Hero banner, events section, and homepage visibility">
      {!schemaReady && <AdminSetupNotice />}
      {(error || notice) && (
        <div className="mb-4 space-y-2">
          {error && (
            <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-4 py-3 text-sm text-[var(--ploy-status-error)]">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.14_145/0.12)] px-4 py-3 text-sm text-[var(--ploy-status-success)]">
              {notice}
            </p>
          )}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
        >
          View homepage
          <ArrowUpRight className="size-4" />
        </a>
        {settings && (
          <p className="text-xs text-[var(--ploy-text-tertiary)]">
            Last updated {new Date(settings.updatedAt).toLocaleString("en-GB")}
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading settings…</p>
      ) : (
        <form onSubmit={handleSave} className="ploy-surface-elevated max-w-3xl space-y-8 p-6">
          <div className="flex items-center gap-2">
            <Home className="size-4 text-[var(--ploy-accent-primary)]" />
            <h2 className="text-lg font-semibold">Homepage controls</h2>
          </div>

          <div className="space-y-3 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={homepageEventsEnabled}
                onChange={(e) => setHomepageEventsEnabled(e.target.checked)}
                disabled={!canEdit}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium">Show Events section on homepage</span>
                <span className="mt-1 block text-xs text-[var(--ploy-text-tertiary)]">
                  When off, the upcoming events strip is hidden even if events are published. Pick
                  the featured event from Events admin.
                </span>
              </span>
            </label>
          </div>

          <div className="space-y-3">
            <Label htmlFor="hero-mode">Hero layout</Label>
            <select
              id="hero-mode"
              value={homepageHeroMode}
              onChange={(e) => setHomepageHeroMode(e.target.value as HomepageHeroMode)}
              disabled={!canEdit}
              className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm"
            >
              {HOMEPAGE_HERO_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--ploy-text-tertiary)]">
              {HOMEPAGE_HERO_MODE_OPTIONS.find((option) => option.value === homepageHeroMode)
                ?.description}
            </p>
          </div>

          {(homepageHeroMode === "banner" || homepageHeroMode === "portrait") && (
            <div className="space-y-8 border-t border-[var(--ploy-border-primary)] pt-8">
              {homepageHeroMode === "banner" && (
                <div className="space-y-3">
                  <Label htmlFor="homepage-banner">Full-width banner image</Label>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--ploy-radius-button)] border border-[var(--ploy-border-primary)] px-4 py-2 text-sm font-medium">
                      <ImagePlus className="size-4" />
                      Upload banner
                      <input
                        id="homepage-banner"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={!canEdit}
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setBannerFile(file);
                          setBannerPreview(file ? URL.createObjectURL(file) : getHomepageAssetUrl(bannerPath));
                        }}
                      />
                    </label>
                    {bannerPreview && (
                      <img src={bannerPreview} alt="" className="h-16 w-32 rounded-md object-cover" />
                    )}
                  </div>
                  <ImageUploadHint hint={HOMEPAGE_BANNER_IMAGE_HINT} />
                  {!bannerPreview && (
                    <p className="text-xs text-[var(--ploy-status-warning)]">
                      Upload a banner image before saving, or the homepage will show the headline without a banner.
                    </p>
                  )}
                </div>
              )}

              {homepageHeroMode === "portrait" && (
                <div className="space-y-3">
                  <Label htmlFor="homepage-portrait">Portrait image (optional override)</Label>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--ploy-radius-button)] border border-[var(--ploy-border-primary)] px-4 py-2 text-sm font-medium">
                      <ImagePlus className="size-4" />
                      Upload portrait
                      <input
                        id="homepage-portrait"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={!canEdit}
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setPortraitFile(file);
                          setPortraitPreview(
                            file
                              ? URL.createObjectURL(file)
                              : getHomepageAssetUrl(portraitPath) ?? DEFAULT_PORTRAIT_URL,
                          );
                        }}
                      />
                    </label>
                    {portraitPreview && (
                      <img src={portraitPreview} alt="" className="h-20 w-16 rounded-md object-cover" />
                    )}
                  </div>
                  <ImageUploadHint hint={HOMEPAGE_PORTRAIT_IMAGE_HINT} />
                  <p className="text-xs text-[var(--ploy-text-tertiary)]">
                    Leave blank to use the default portrait.
                  </p>
                </div>
              )}
            </div>
          )}

          {canEdit ? (
            <Button type="submit" variant="primary" disabled={saving}>
              <Save className="size-4" />
              {saving ? "Saving…" : "Save homepage settings"}
            </Button>
          ) : (
            <p className="text-sm text-[var(--ploy-text-secondary)]">
              You can view these settings. An Admin Manager or approver can save changes.
            </p>
          )}
        </form>
      )}
    </AdminLayoutShell>
  );
}
