"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Download,
  Eye,
  FileText,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { AdminInsightPreviewModal, type InsightPreviewData } from "@/components/admin/admin-insight-preview-modal";
import { AdminSetupNotice } from "@/components/admin/admin-setup-notice";
import { AdminHelpTip } from "@/components/admin/admin-help-tip";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminRebuildSeoButton } from "@/components/admin/admin-rebuild-seo-button";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/context/admin-auth-provider";
import {
  canApproveInsights,
  canPermanentlyDeleteInsights,
} from "@/lib/auth/permissions";
import { triggerSiteRebuild } from "@/lib/events/trigger-rebuild";
import {
  hideRestoreNoticeWithRebuild,
  publishNoticeWithRebuild,
} from "@/lib/events/publish-notice";
import { INSIGHTS_ADMIN_COPY } from "@/lib/admin/plain-language-copy";
import {
  INSIGHT_STATUS_LABELS,
  MAX_HOMEPAGE_FEATURED_INSIGHTS,
} from "@/lib/insights/constants";
import {
  clearInsightHomepageFeatured,
  deleteInsightPermanently,
  formatInsightDate,
  getAdminInsights,
  getPendingInsights,
  insightsToCsv,
  isInsightMediaSchemaReady,
  isInsightSeoSchemaReady,
  isPhase3SchemaReady,
  logInsightAudit,
  setInsightHomepageFeatured,
  updateInsight,
} from "@/lib/insights/articles";
import type { PlatformInsight } from "@/lib/insights/types";
import type { LiveSiteInsight } from "@/lib/insights/public-insights";
import {
  getHomepageFeaturedInsightsLiveOnSite,
  getInsightsLiveOnSite,
  PRELOADED_INSIGHTS,
} from "@/lib/insights/public-insights";
import {
  getPreloadedContentSettings,
  hidePreloadedInsight,
  isPreloadedContentSchemaReady,
  restorePreloadedInsight,
} from "@/lib/content/preloaded-content";
import type { InsightArticleStatus } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/client";

function goToEditor(options?: { id?: string; prefill?: string }) {
  if (options?.id) {
    window.location.href = `/admin/insights/edit?id=${encodeURIComponent(options.id)}`;
    return;
  }
  if (options?.prefill) {
    window.location.href = `/admin/insights/edit?prefill=${encodeURIComponent(options.prefill)}`;
    return;
  }
  window.location.href = "/admin/insights/edit";
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function InsightsDashboard() {
  const { profile } = useAdminAuth();
  const isApprover = canApproveInsights(profile);
  const canDelete = canPermanentlyDeleteInsights(profile);
  const [insights, setInsights] = useState<PlatformInsight[]>([]);
  const [liveInsights, setLiveInsights] = useState<LiveSiteInsight[]>([]);
  const [homepageFeaturedLive, setHomepageFeaturedLive] = useState<LiveSiteInsight[]>([]);
  const [pending, setPending] = useState<PlatformInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [schemaReady, setSchemaReady] = useState(true);
  const [mediaSchemaReady, setMediaSchemaReady] = useState(true);
  const [seoSchemaReady, setSeoSchemaReady] = useState(true);
  const [preloadedControlsReady, setPreloadedControlsReady] = useState(true);
  const [hiddenPreloadedSlugs, setHiddenPreloadedSlugs] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<InsightPreviewData | null>(null);

  async function loadInsights() {
    try {
      setError(null);
      setSchemaReady(await isPhase3SchemaReady());
      setMediaSchemaReady(await isInsightMediaSchemaReady());
      setSeoSchemaReady(await isInsightSeoSchemaReady());
      setPreloadedControlsReady(await isPreloadedContentSchemaReady());
      const [allInsights, pendingInsights, liveOnSite, homepageFeatured] = await Promise.all([
        getAdminInsights(),
        isApprover ? getPendingInsights() : Promise.resolve([]),
        getInsightsLiveOnSite(),
        getHomepageFeaturedInsightsLiveOnSite(),
      ]);
      setInsights(allInsights);
      setPending(pendingInsights);
      setLiveInsights(liveOnSite);
      setHomepageFeaturedLive(homepageFeatured);
      setHiddenPreloadedSlugs((await getPreloadedContentSettings()).hiddenInsightSlugs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInsights();
  }, [isApprover]);

  const sortedInsights = useMemo(
    () =>
      [...insights].sort((a, b) => {
        const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return bTime - aTime || a.title.localeCompare(b.title);
      }),
    [insights],
  );

  function startEdit(insight: PlatformInsight) {
    goToEditor({ id: insight.id });
  }

  function startFromLiveInsight(insight: LiveSiteInsight) {
    if (insight.cmsId) {
      goToEditor({ id: insight.cmsId });
      return;
    }
    goToEditor({ prefill: insight.slug });
  }

  const homepageFeaturedSlugs = useMemo(
    () => new Set(homepageFeaturedLive.map((insight) => insight.slug)),
    [homepageFeaturedLive],
  );

  const hiddenPreloadedSet = useMemo(
    () => new Set(hiddenPreloadedSlugs),
    [hiddenPreloadedSlugs],
  );

  const visiblePreloadedArticles = useMemo(
    () => PRELOADED_INSIGHTS.filter((item) => !hiddenPreloadedSet.has(item.slug)),
    [hiddenPreloadedSet],
  );

  const hiddenPreloadedArticles = useMemo(
    () => PRELOADED_INSIGHTS.filter((item) => hiddenPreloadedSet.has(item.slug)),
    [hiddenPreloadedSet],
  );

  function startFromPreloadedArticle(article: PlatformInsight) {
    const live = liveInsights.find((item) => item.slug === article.slug);
    if (live) {
      startFromLiveInsight(live);
      return;
    }

    startFromLiveInsight({
      ...article,
      source: "static",
      cmsId: null,
    });
  }

  async function handleHidePreloadedArticle(article: PlatformInsight) {
    if (!isApprover || !preloadedControlsReady) return;
    if (!window.confirm(`Remove “${article.title}” from the public site?`)) return;

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await hidePreloadedInsight(article.slug, profile?.id);
      if (isApprover) {
        const rebuild = await triggerSiteRebuild();
        setNotice(
          hideRestoreNoticeWithRebuild(
            INSIGHTS_ADMIN_COPY.removedFromSiteNotice(article.title),
            rebuild,
          ),
        );
      } else {
        setNotice(INSIGHTS_ADMIN_COPY.removedFromSiteNotice(article.title));
      }
      await loadInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove article from site");
    } finally {
      setSaving(false);
    }
  }

  async function handleRestorePreloadedArticle(article: PlatformInsight) {
    if (!isApprover || !preloadedControlsReady) return;

    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await restorePreloadedInsight(article.slug, profile?.id);
      if (isApprover) {
        const rebuild = await triggerSiteRebuild();
        setNotice(
          hideRestoreNoticeWithRebuild(
            INSIGHTS_ADMIN_COPY.restoredToSiteNotice(article.title),
            rebuild,
          ),
        );
      } else {
        setNotice(INSIGHTS_ADMIN_COPY.restoredToSiteNotice(article.title));
      }
      await loadInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to restore article");
    } finally {
      setSaving(false);
    }
  }

  function openPreviewFromInsight(insight: PlatformInsight) {
    setPreviewArticle({
      title: insight.title,
      category: insight.category,
      summary: insight.summary,
      body: insight.body,
      publishedAt: toDateInputValue(insight.publishedAt),
      slug: insight.slug,
      heroImageUrl: insight.heroImageUrl,
      sourceLabel: insight.sourceLabel,
      sourceUrl: insight.sourceUrl,
    });
    setPreviewOpen(true);
  }

  async function approveInsight(insight: PlatformInsight) {
    setSaving(true);
    setError(null);
    try {
      const saved = await updateInsight(insight.id, {
        status: "published",
        manuallyHidden: false,
        approvedBy: profile?.id ?? null,
        approvedAt: new Date().toISOString(),
        rejectionNote: null,
        publishedAt: insight.publishedAt ?? new Date().toISOString(),
      });
      await logInsightAudit("insight_published", saved.id, {
        title: saved.title,
        slug: saved.slug,
        publishedBy: profile?.full_name,
        approvedFromPending: true,
      });
      const rebuild = await triggerSiteRebuild();
      setNotice(publishNoticeWithRebuild("Article approved.", rebuild));
      await loadInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve article");
    } finally {
      setSaving(false);
    }
  }

  async function rejectInsight(insight: PlatformInsight) {
    const note = window.prompt("Optional note for the person who submitted this article:");
    setSaving(true);
    try {
      await updateInsight(insight.id, {
        status: "draft",
        rejectionNote: note?.trim() || "Please revise and resubmit.",
      });
      await loadInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send back article");
    } finally {
      setSaving(false);
    }
  }

  async function toggleHidden(insight: PlatformInsight) {
    try {
      await updateInsight(insight.id, { manuallyHidden: !insight.manuallyHidden });
      await loadInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update visibility");
    }
  }

  async function toggleHomepageFeatured(insight: PlatformInsight) {
    if (!isApprover) return;
    setSaving(true);
    setError(null);
    try {
      if (insight.isHomepageFeatured) {
        await clearInsightHomepageFeatured(insight.id);
      } else {
        await setInsightHomepageFeatured(insight.id);
      }
      setNotice(
        insight.isHomepageFeatured
          ? "Article removed from homepage feature slots."
          : "Article added to homepage feature slots.",
      );
      await loadInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update homepage feature");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!canDelete) return;
    if (!window.confirm("Delete this article permanently? This cannot be undone.")) return;
    try {
      await deleteInsightPermanently(id);
      await loadInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete article");
    }
  }

  async function handleRebuild() {
    setRebuilding(true);
    setError(null);
    try {
      const result = await triggerSiteRebuild();
      setNotice(result.message);
      if (!result.ok) setError(result.message);
    } finally {
      setRebuilding(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <AdminLayoutShell title="Insights" subtitle="Manage essays and field notes">
        <p className="ploy-surface-elevated p-6 text-sm text-[var(--ploy-text-secondary)]">
          {INSIGHTS_ADMIN_COPY.notConnected}{" "}
          <a href="/insights" className="underline">/insights</a>.
        </p>
      </AdminLayoutShell>
    );
  }

  return (
    <AdminLayoutShell title="Insights" subtitle="Your stories — write, review, and publish">
      {!schemaReady && <AdminSetupNotice variant="insights" />}
      {schemaReady && !preloadedControlsReady && (
        <div className="mb-6 rounded-[var(--ploy-radius-md)] border border-[oklch(0.72_0.14_75/0.35)] bg-[oklch(0.72_0.14_75/0.1)] px-4 py-3 text-sm text-[var(--ploy-text-secondary)]">
          Run <code className="text-xs">supabase/migrations/013_preloaded_content_controls.sql</code> in Supabase
          to remove or restore pre-loaded articles from the public site.
        </div>
      )}
      {schemaReady && !mediaSchemaReady && (
        <div className="mb-6 rounded-[var(--ploy-radius-md)] border border-[oklch(0.72_0.14_75/0.35)] bg-[oklch(0.72_0.14_75/0.1)] px-4 py-3 text-sm text-[var(--ploy-text-secondary)]">
          Run <code className="text-xs">supabase/migrations/014_insight_hero_images.sql</code> in Supabase to
          upload header images and add original-publication credits.
        </div>
      )}
      {schemaReady && !seoSchemaReady && (
        <div className="mb-6 rounded-[var(--ploy-radius-md)] border border-[oklch(0.72_0.14_75/0.35)] bg-[oklch(0.72_0.14_75/0.1)] px-4 py-3 text-sm text-[var(--ploy-text-secondary)]">
          Run <code className="text-xs">supabase/migrations/019_contact_geo_foundation.sql</code> to
          manage search descriptions and accessible social previews.
        </div>
      )}
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
        <Button type="button" variant="primary" size="sm" onClick={() => goToEditor()}>
          Write a story
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            downloadCsv(
              `insights-${new Date().toISOString().slice(0, 10)}.csv`,
              insightsToCsv(insights),
            )
          }
        >
          <Download className="size-4 shrink-0" />
          Export CSV
        </Button>
        {isApprover && (
          <AdminRebuildSeoButton rebuilding={rebuilding} onClick={handleRebuild} />
        )}
        <a
          href="/insights"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
        >
          View public page
          <ArrowUpRight className="size-4" />
        </a>
      </div>

      <div className="ploy-surface-elevated mb-8 space-y-5 p-6">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-[var(--ploy-accent-primary)]" />
          <h2 className="text-lg font-semibold">
            {INSIGHTS_ADMIN_COPY.preloadedSectionTitle} ({PRELOADED_INSIGHTS.length})
          </h2>
          <AdminHelpTip text={INSIGHTS_ADMIN_COPY.preloadedSectionHelp} />
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {visiblePreloadedArticles.map((article) => {
            const managed = insights.find(
              (item) => item.slug === article.slug && item.status === "published",
            );
            return (
              <li
                key={article.slug}
                className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4"
              >
                <div className="space-y-1">
                  <p className="font-medium">{article.title}</p>
                  <p className="text-xs text-[var(--ploy-text-tertiary)]">
                    {article.category} · /insights/{article.slug}
                  </p>
                  <p className="text-xs text-[var(--ploy-text-tertiary)]">
                    {managed ? INSIGHTS_ADMIN_COPY.managedLabel : INSIGHTS_ADMIN_COPY.preloadedLabel}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      managed ? startEdit(managed) : startFromPreloadedArticle(article)
                    }
                  >
                    {managed ? INSIGHTS_ADMIN_COPY.edit : INSIGHTS_ADMIN_COPY.startManaging}
                  </Button>
                  {isApprover && preloadedControlsReady && !managed && (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={saving}
                        onClick={() => handleHidePreloadedArticle(article)}
                      >
                        {INSIGHTS_ADMIN_COPY.removeFromSite}
                      </Button>
                      <AdminHelpTip text={INSIGHTS_ADMIN_COPY.removeFromSiteHelp} />
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {hiddenPreloadedArticles.length > 0 && (
          <div className="space-y-3 border-t border-[var(--ploy-border-primary)] pt-5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{INSIGHTS_ADMIN_COPY.hiddenPreloadedTitle}</h3>
              <AdminHelpTip text={INSIGHTS_ADMIN_COPY.hiddenPreloadedHelp} />
            </div>
            <ul className="space-y-3">
              {hiddenPreloadedArticles.map((article) => (
                <li
                  key={article.slug}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-xs text-[var(--ploy-text-tertiary)]">/insights/{article.slug}</p>
                  </div>
                  {isApprover && preloadedControlsReady && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={saving}
                      onClick={() => handleRestorePreloadedArticle(article)}
                    >
                      {INSIGHTS_ADMIN_COPY.restoreToSite}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="ploy-surface-elevated mb-8 space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-[var(--ploy-accent-primary)]" />
              <h2 className="text-lg font-semibold">
                {INSIGHTS_ADMIN_COPY.liveSectionTitle} ({liveInsights.length})
              </h2>
              <AdminHelpTip text={INSIGHTS_ADMIN_COPY.liveSectionHelp} />
            </div>
            <p className="mt-1 text-sm text-[var(--ploy-text-secondary)]">
              These articles are what visitors see on{" "}
              <a href="/insights" target="_blank" rel="noopener noreferrer" className="underline">
                /insights
              </a>{" "}
              and the homepage Insights section.
            </p>
          </div>
          {liveInsights[0]?.source === "static" && (
            <p className="max-w-sm rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-4 py-3 text-xs text-[var(--ploy-text-secondary)]">
              {INSIGHTS_ADMIN_COPY.preloadedNotice}
            </p>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading public catalog…</p>
        ) : liveInsights.length === 0 ? (
          <p className="text-sm text-[var(--ploy-text-secondary)]">
            No articles are live on the site yet.
          </p>
        ) : (
          <>
            {homepageFeaturedLive.length > 0 && (
              <div className="space-y-3">
                <p className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--ploy-accent-primary)]">
                  <Star className="size-3.5 fill-current" />
                  Homepage featured ({homepageFeaturedLive.length} of {MAX_HOMEPAGE_FEATURED_INSIGHTS})
                </p>
                <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {homepageFeaturedLive.map((insight, index) => (
                    <li
                      key={insight.slug}
                      className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-accent-primary)]/30 bg-[oklch(0.68_0.145_29/0.06)] p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ploy-accent-primary)]">
                        Slot {index + 1}
                      </p>
                      <p className="mt-2 font-medium">{insight.title}</p>
                      <p className="mt-1 text-xs text-[var(--ploy-text-tertiary)]">
                        {insight.category} · /insights/{insight.slug}
                      </p>
                      <p className="mt-1 text-xs text-[var(--ploy-text-tertiary)]">
                        {insight.source === "static"
                          ? liveInsights.some((item) => item.isHomepageFeatured)
                            ? INSIGHTS_ADMIN_COPY.preloadedLabel
                            : INSIGHTS_ADMIN_COPY.defaultHomepageSlots
                          : INSIGHTS_ADMIN_COPY.managedLabel}
                      </p>
                      <div className="mt-4 flex items-center gap-1">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => startFromLiveInsight(insight)}
                        >
                          {insight.cmsId
                            ? INSIGHTS_ADMIN_COPY.edit
                            : INSIGHTS_ADMIN_COPY.startManaging}
                        </Button>
                        {!insight.cmsId && (
                          <AdminHelpTip text={INSIGHTS_ADMIN_COPY.startManagingHelp} />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ul className="grid gap-3 sm:grid-cols-2">
              {liveInsights.map((insight) => (
                <li
                  key={insight.slug}
                  className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{insight.title}</p>
                        {homepageFeaturedSlugs.has(insight.slug) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.68_0.145_29/0.12)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[var(--ploy-accent-primary)]">
                            <Star className="size-3 fill-current" />
                            Homepage
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--ploy-text-tertiary)]">
                        {insight.category} · /insights/{insight.slug}
                      </p>
                      <p className="text-xs text-[var(--ploy-text-tertiary)]">
                        {insight.publishedAt ? formatInsightDate(insight.publishedAt) : "No date"} ·{" "}
                        {insight.source === "static"
                          ? INSIGHTS_ADMIN_COPY.preloadedLabel
                          : INSIGHTS_ADMIN_COPY.managedLabel}
                      </p>
                      <p className="line-clamp-2 text-sm text-[var(--ploy-text-secondary)]">
                        {insight.summary}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={() => startFromLiveInsight(insight)}
                      >
                        {insight.cmsId
                          ? INSIGHTS_ADMIN_COPY.edit
                          : INSIGHTS_ADMIN_COPY.startManaging}
                      </Button>
                      {!insight.cmsId && (
                        <AdminHelpTip text={INSIGHTS_ADMIN_COPY.startManagingHelp} />
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {isApprover && pending.length > 0 && (
        <div className="ploy-surface-elevated mb-8 space-y-4 p-6">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-[var(--ploy-accent-primary)]" />
            <h2 className="text-lg font-semibold">Awaiting approval ({pending.length})</h2>
          </div>
          <ul className="space-y-3">
            {pending.map((insight) => (
              <li
                key={insight.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4"
              >
                <div>
                  <p className="font-medium">{insight.title}</p>
                  <p className="text-xs text-[var(--ploy-text-tertiary)]">
                    /insights/{insight.slug} · {insight.category}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={() => approveInsight(insight)}
                    disabled={saving}
                  >
                    <Check className="size-4" />
                    Approve & publish
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => startEdit(insight)}>
                    Review
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => rejectInsight(insight)}
                    disabled={saving}
                  >
                    <X className="size-4" />
                    Send back
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="ploy-surface-elevated space-y-6 p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{INSIGHTS_ADMIN_COPY.managedSectionTitle}</h2>
          <AdminHelpTip text={INSIGHTS_ADMIN_COPY.managedSectionHelp} />
        </div>
        {loading ? (
          <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading articles…</p>
        ) : sortedInsights.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--ploy-border-primary)] px-6 py-12 text-center">
            <p className="text-sm text-[var(--ploy-text-secondary)]">{INSIGHTS_ADMIN_COPY.noManagedYet}</p>
            <Button type="button" variant="primary" size="sm" className="mt-4" onClick={() => goToEditor()}>
              Write your first story
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--ploy-border-primary)]">
            {sortedInsights.map((insight) => (
              <li key={insight.id} className="flex flex-wrap items-start justify-between gap-4 py-5 first:pt-0">
                <button
                  type="button"
                  onClick={() => startEdit(insight)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="font-serif text-xl font-semibold leading-snug hover:underline">
                    {insight.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--ploy-text-secondary)]">
                    {insight.summary}
                  </p>
                  <p className="mt-2 text-xs text-[var(--ploy-text-tertiary)]">
                    {INSIGHT_STATUS_LABELS[insight.status]}
                    {insight.manuallyHidden ? " · Hidden" : ""}
                    {insight.isHomepageFeatured ? " · Homepage featured" : ""}
                    {insight.publishedAt ? ` · ${formatInsightDate(insight.publishedAt)}` : ""}
                    {" · "}
                    {insight.category}
                  </p>
                </button>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(insight)}>
                    Edit
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => openPreviewFromInsight(insight)}>
                    <Eye className="size-4" />
                    Preview
                  </Button>
                  {isApprover && insight.status === "published" && !insight.manuallyHidden && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleHomepageFeatured(insight)}
                      disabled={saving}
                    >
                      {insight.isHomepageFeatured ? "Unfeature" : "Feature"}
                    </Button>
                  )}
                  {isApprover && insight.status === "published" && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => toggleHidden(insight)}>
                      {insight.manuallyHidden ? "Show" : "Hide"}
                    </Button>
                  )}
                  {canDelete && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(insight.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AdminInsightPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        article={previewArticle}
      />
    </AdminLayoutShell>
  );
}
