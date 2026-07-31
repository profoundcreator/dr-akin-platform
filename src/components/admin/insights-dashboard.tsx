"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Download,
  FileText,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { AdminSetupNotice } from "@/components/admin/admin-setup-notice";
import { AdminHelpTip } from "@/components/admin/admin-help-tip";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminRebuildSeoButton } from "@/components/admin/admin-rebuild-seo-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useAdminAuth } from "@/context/admin-auth-provider";
import {
  canApproveInsights,
  canPermanentlyDeleteInsights,
} from "@/lib/auth/permissions";
import { triggerSiteRebuild } from "@/lib/events/trigger-rebuild";
import { INSIGHTS_ADMIN_COPY } from "@/lib/admin/plain-language-copy";
import {
  INSIGHT_CATEGORIES,
  INSIGHT_STATUS_LABELS,
  MAX_HOMEPAGE_FEATURED_INSIGHTS,
} from "@/lib/insights/constants";
import {
  clearInsightHomepageFeatured,
  createInsight,
  deleteInsightPermanently,
  formatInsightDate,
  getAdminInsights,
  getPendingInsights,
  insightsToCsv,
  isPhase3SchemaReady,
  isValidInsightSlug,
  logInsightAudit,
  setInsightHomepageFeatured,
  slugifyInsightTitle,
  updateInsight,
} from "@/lib/insights/articles";
import type { InsightInput, PlatformInsight } from "@/lib/insights/types";
import type { LiveSiteInsight } from "@/lib/insights/public-insights";
import {
  getHomepageFeaturedInsightsLiveOnSite,
  getInsightsLiveOnSite,
} from "@/lib/insights/public-insights";
import type { InsightArticleStatus } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const EMPTY_FORM = {
  slug: "",
  title: "",
  category: INSIGHT_CATEGORIES[0],
  summary: "",
  body: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  isHomepageFeatured: false,
  sortOrder: 0,
};

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function toPublishedAtIso(dateValue: string): string | null {
  if (!dateValue.trim()) return null;
  return new Date(`${dateValue}T12:00:00`).toISOString();
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
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
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [schemaReady, setSchemaReady] = useState(true);

  async function loadInsights() {
    try {
      setError(null);
      setSchemaReady(await isPhase3SchemaReady());
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

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function startEdit(insight: PlatformInsight) {
    setEditingId(insight.id);
    setForm({
      slug: insight.slug,
      title: insight.title,
      category: insight.category,
      summary: insight.summary,
      body: insight.body,
      publishedAt: toDateInputValue(insight.publishedAt),
      isHomepageFeatured: insight.isHomepageFeatured,
      sortOrder: insight.sortOrder,
    });
  }

  function startFromLiveInsight(insight: LiveSiteInsight) {
    const cmsInsight = insights.find((item) => item.slug === insight.slug);
    if (cmsInsight) {
      startEdit(cmsInsight);
      return;
    }

    resetForm();
    setForm({
      slug: insight.slug,
      title: insight.title,
      category: insight.category,
      summary: insight.summary,
      body: insight.body,
      publishedAt: toDateInputValue(insight.publishedAt),
      isHomepageFeatured: insight.isHomepageFeatured,
      sortOrder: insight.sortOrder,
    });
  }

  const homepageFeaturedSlugs = useMemo(
    () => new Set(homepageFeaturedLive.map((insight) => insight.slug)),
    [homepageFeaturedLive],
  );

  async function buildInput(status?: InsightArticleStatus): Promise<InsightInput> {
    const slug = form.slug.trim().toLowerCase() || slugifyInsightTitle(form.title);

    if (!form.title.trim()) throw new Error("Article title is required.");
    if (!form.summary.trim()) throw new Error("Summary is required.");
    if (!form.body.trim()) throw new Error("Body is required.");
    if (!isValidInsightSlug(slug)) {
      throw new Error("Link name must use lowercase letters, numbers, and hyphens only.");
    }

    return {
      slug,
      title: form.title,
      category: form.category,
      summary: form.summary,
      body: form.body,
      publishedAt: toPublishedAtIso(form.publishedAt),
      sortOrder: form.sortOrder,
      status,
    };
  }

  async function saveInsight(mode: "draft" | "submit" | "publish") {
    setError(null);
    setNotice(null);
    setSaving(true);

    try {
      const input = await buildInput(
        mode === "publish" ? "published" : mode === "submit" ? "pending_approval" : "draft",
      );

      let saved: PlatformInsight;

      if (editingId) {
        saved = await updateInsight(editingId, {
          ...input,
          ...(mode === "publish"
            ? {
                approvedBy: profile?.id ?? null,
                approvedAt: new Date().toISOString(),
                rejectionNote: null,
                publishedAt: input.publishedAt ?? new Date().toISOString(),
              }
            : {}),
          ...(mode === "submit"
            ? {
                submittedBy: profile?.id ?? null,
                rejectionNote: null,
              }
            : {}),
        });
      } else if (mode === "publish" && isApprover) {
        saved = await createInsight(input, {
          createdBy: profile?.id,
          publishDirectly: true,
          approverId: profile?.id,
        });
      } else if (mode === "submit") {
        saved = await createInsight(input, {
          createdBy: profile?.id,
          submitForApproval: true,
        });
      } else {
        saved = await createInsight(input, { createdBy: profile?.id });
      }

      if (mode === "submit") {
        await logInsightAudit("insight_submitted_for_approval", saved.id, {
          title: saved.title,
          slug: saved.slug,
          submittedBy: profile?.full_name,
        });
        setNotice("Article submitted for approval. An approver will review it before it goes public.");
      }

      if (mode === "publish") {
        await logInsightAudit("insight_published", saved.id, {
          title: saved.title,
          slug: saved.slug,
          publishedBy: profile?.full_name,
        });

        let publishNotice: string | null = null;

        if (isApprover && form.isHomepageFeatured) {
          try {
            await setInsightHomepageFeatured(saved.id);
          } catch (featuredError) {
            publishNotice =
              featuredError instanceof Error
                ? featuredError.message
                : "Could not feature article on homepage.";
          }
        } else if (isApprover && editingId && !form.isHomepageFeatured && saved.isHomepageFeatured) {
          try {
            await clearInsightHomepageFeatured(saved.id);
          } catch (featuredError) {
            publishNotice =
              featuredError instanceof Error
                ? featuredError.message
                : "Could not remove homepage feature.";
          }
        }

        if (!publishNotice) {
          const rebuild = await triggerSiteRebuild();
          publishNotice = rebuild.ok
            ? rebuild.message
            : `Article published. ${rebuild.message}`;
        }

        setNotice(publishNotice);
      }

      resetForm();
      await loadInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save article");
    } finally {
      setSaving(false);
    }
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
      setNotice(rebuild.ok ? rebuild.message : `Article approved. ${rebuild.message}`);
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
      if (editingId === id) resetForm();
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
    <AdminLayoutShell title="Insights" subtitle="Create articles, manage approvals, and feature on homepage">
      {!schemaReady && <AdminSetupNotice variant="insights" />}
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

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form
          className="ploy-surface-elevated space-y-5 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            saveInsight(isApprover ? "publish" : "submit");
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Plus className="size-4 text-[var(--ploy-accent-primary)]" />
              <h2 className="text-lg font-semibold">{editingId ? "Edit article" : "Add article"}</h2>
            </div>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                Cancel edit
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="insight-title" required>
              Title
            </Label>
            <Input
              id="insight-title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                  slug: prev.slug || slugifyInsightTitle(e.target.value),
                }))
              }
              placeholder="Culture as a Strategic Asset"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insight-slug" required>
              Link name
            </Label>
            <Input
              id="insight-slug"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))}
              placeholder="culture-as-strategic-asset"
            />
            <p className="text-xs text-[var(--ploy-text-tertiary)]">
              Public URL: /insights/{form.slug || "your-link"}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="insight-category" required>
                Category
              </Label>
              <select
                id="insight-category"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm"
              >
                {INSIGHT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="insight-date">Publish date</Label>
              <Input
                id="insight-date"
                type="date"
                value={form.publishedAt}
                onChange={(e) => setForm((prev) => ({ ...prev, publishedAt: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="insight-summary" required>
              Summary
            </Label>
            <textarea
              id="insight-summary"
              value={form.summary}
              onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
              rows={3}
              className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm"
              placeholder="Short teaser shown on cards and search results"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insight-body" required>
              Body
            </Label>
            <RichTextEditor
              id="insight-body"
              value={form.body}
              onChange={(body) => setForm((prev) => ({ ...prev, body }))}
            />
            <p className="text-xs text-[var(--ploy-text-tertiary)]">
              Use bold, headings, and links. Content is sanitized before publishing.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="insight-sort">Sort order</Label>
            <Input
              id="insight-sort"
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 0 }))
              }
            />
          </div>

          {isApprover && (
            <label className="flex items-start gap-3 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4">
              <input
                type="checkbox"
                checked={form.isHomepageFeatured}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isHomepageFeatured: e.target.checked }))
                }
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium">Feature on homepage</span>
                <span className="mt-1 block text-xs text-[var(--ploy-text-tertiary)]">
                  Shows in the homepage Insights section. Up to {MAX_HOMEPAGE_FEATURED_INSIGHTS}{" "}
                  articles can be featured at once.
                </span>
              </span>
            </label>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" disabled={saving} onClick={() => saveInsight("draft")}>
              Save draft
            </Button>
            {isApprover ? (
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Publish changes" : "Publish article"}
              </Button>
            ) : (
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Submitting…" : "Submit for approval"}
              </Button>
            )}
          </div>
        </form>

        <div className="ploy-surface-elevated space-y-6 p-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{INSIGHTS_ADMIN_COPY.managedSectionTitle}</h2>
              <AdminHelpTip text={INSIGHTS_ADMIN_COPY.managedSectionHelp} />
            </div>
          </div>
          {loading ? (
            <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading articles…</p>
          ) : sortedInsights.length === 0 ? (
            <p className="text-sm text-[var(--ploy-text-secondary)]">
              {INSIGHTS_ADMIN_COPY.noManagedYet}
            </p>
          ) : (
            <ul className="space-y-4">
              {sortedInsights.map((insight) => (
                <li
                  key={insight.id}
                  className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium">{insight.title}</p>
                      <p className="text-xs text-[var(--ploy-text-tertiary)]">
                        /insights/{insight.slug} · {INSIGHT_STATUS_LABELS[insight.status]}
                        {insight.manuallyHidden ? " · Hidden" : ""}
                        {insight.isHomepageFeatured
                          ? ` · Homepage #${insight.homepageFeatureOrder ?? "?"}`
                          : ""}
                      </p>
                      <p className="text-sm text-[var(--ploy-text-secondary)]">
                        {insight.category}
                        {insight.publishedAt ? ` · ${formatInsightDate(insight.publishedAt)}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(insight)}>
                        Edit
                      </Button>
                      {isApprover && insight.status === "published" && !insight.manuallyHidden && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHomepageFeatured(insight)}
                          disabled={saving}
                        >
                          {insight.isHomepageFeatured ? "Unfeature" : "Feature on homepage"}
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
                          Delete
                        </Button>
                      )}
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
