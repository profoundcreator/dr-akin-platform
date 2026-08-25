"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  ImagePlus,
  Settings2,
  X,
} from "lucide-react";
import {
  AdminInsightPreviewModal,
  type InsightPreviewData,
} from "@/components/admin/admin-insight-preview-modal";
import { Button } from "@/components/ui/button";
import { MediumRichTextEditor } from "@/components/ui/medium-rich-text-editor";
import { useAdminAuth } from "@/context/admin-auth-provider";
import { canApproveInsights } from "@/lib/auth/permissions";
import { INSIGHTS_ADMIN_COPY } from "@/lib/admin/plain-language-copy";
import {
  INSIGHT_CATEGORIES,
  INSIGHT_HERO_IMAGE_HINT,
  MAX_HOMEPAGE_FEATURED_INSIGHTS,
} from "@/lib/insights/constants";
import {
  getAdminInsights,
  getInsightById,
  isInsightMediaSchemaReady,
  isInsightSeoSchemaReady,
  isPhase3SchemaReady,
  slugifyInsightTitle,
} from "@/lib/insights/articles";
import { PRELOADED_INSIGHTS } from "@/lib/insights/public-insights";
import {
  EMPTY_INSIGHT_FORM,
  getHeroPreview,
  insightToForm,
  useInsightEditorSave,
  type InsightFormState,
} from "@/lib/insights/use-insight-editor-form";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function readSearchParams() {
  if (typeof window === "undefined") return { id: null as string | null, prefill: null as string | null };
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get("id"),
    prefill: params.get("prefill"),
  };
}

export function InsightMediumEditor() {
  const { profile } = useAdminAuth();
  const isApprover = canApproveInsights(profile);
  const [{ id, prefill }] = useState(readSearchParams);

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<InsightFormState>(EMPTY_INSIGHT_FORM);
  const [editingId, setEditingId] = useState<string | null>(id);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [existingHeroPath, setExistingHeroPath] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [schemaReady, setSchemaReady] = useState(true);
  const [mediaSchemaReady, setMediaSchemaReady] = useState(true);
  const [seoSchemaReady, setSeoSchemaReady] = useState(true);

  const heroPreview = useMemo(
    () => getHeroPreview(heroFile, existingHeroPath),
    [heroFile, existingHeroPath],
  );

  const { saveInsight, saving, error, notice, setError } = useInsightEditorSave({
    editingId,
    profileId: profile?.id,
    profileName: profile?.full_name,
    isApprover,
    mediaSchemaReady,
    seoSchemaReady,
    existingHeroPath,
    heroFile,
  });

  useEffect(() => {
    async function load() {
      try {
        setSchemaReady(await isPhase3SchemaReady());
        setMediaSchemaReady(await isInsightMediaSchemaReady());
        setSeoSchemaReady(await isInsightSeoSchemaReady());

        if (id) {
          const insight = await getInsightById(id);
          if (insight) {
            setEditingId(insight.id);
            setForm(insightToForm(insight));
            setExistingHeroPath(insight.heroImagePath);
          }
        } else if (prefill) {
          const preloaded = PRELOADED_INSIGHTS.find((a) => a.slug === prefill);
          if (preloaded) {
            const managed = (await getAdminInsights()).find((a) => a.slug === prefill);
            if (managed) {
              setEditingId(managed.id);
              setForm(insightToForm(managed));
              setExistingHeroPath(managed.heroImagePath);
            } else {
              setForm({
                ...EMPTY_INSIGHT_FORM,
                slug: preloaded.slug,
                title: preloaded.title,
                category: preloaded.category,
                summary: preloaded.summary,
                seoDescription: preloaded.seoDescription ?? "",
                body: preloaded.body,
                publishedAt: preloaded.publishedAt?.slice(0, 10) ?? EMPTY_INSIGHT_FORM.publishedAt,
                sortOrder: preloaded.sortOrder,
              });
            }
          }
        }
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id, prefill]);

  function openPreview() {
    if (!form.title.trim() || !form.body.trim()) {
      setError(INSIGHTS_ADMIN_COPY.previewMissingFields);
      return;
    }
    setError(null);
    setPreviewOpen(true);
  }

  const previewArticle: InsightPreviewData | null =
    form.title.trim() && form.body.trim()
      ? {
          title: form.title.trim(),
          category: form.category,
          summary: form.summary.trim(),
          body: form.body,
          publishedAt: form.publishedAt,
          slug: form.slug.trim().toLowerCase() || slugifyInsightTitle(form.title),
          heroImageUrl: heroPreview,
          sourceLabel: form.sourceLabel.trim() || null,
          sourceUrl: form.sourceUrl.trim() || null,
        }
      : null;

  async function handleSave(mode: "draft" | "submit" | "publish") {
    try {
      const saved = await saveInsight(form, mode);
      if (saved && !editingId) {
        window.history.replaceState({}, "", `/admin/insights/edit?id=${saved.id}`);
        setEditingId(saved.id);
      }
      if (mode === "publish" || mode === "submit") {
        setTimeout(() => {
          window.location.href = "/admin/insights";
        }, 1200);
      }
    } catch {
      // error set in hook
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-sm text-[var(--ploy-text-secondary)]">
        {INSIGHTS_ADMIN_COPY.notConnected}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] text-sm text-[var(--ploy-text-tertiary)]">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[var(--ploy-text-primary)]">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-[#fafafa]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[820px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <a
            href="/admin/insights"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ploy-text-secondary)] no-underline hover:text-[var(--ploy-text-primary)]"
          >
            <ArrowLeft className="size-4" />
            Stories
          </a>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setSettingsOpen((v) => !v)}>
              <Settings2 className="size-4" />
              Settings
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={openPreview} disabled={saving}>
              <Eye className="size-4" />
              Preview
            </Button>
            <Button type="button" variant="secondary" size="sm" disabled={saving} onClick={() => handleSave("draft")}>
              {saving ? "Saving…" : "Save draft"}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={saving}
              onClick={() => handleSave(isApprover ? "publish" : "submit")}
            >
              {saving ? "Saving…" : isApprover ? "Publish" : "Submit"}
            </Button>
          </div>
        </div>
      </header>

      {(error || notice) && (
        <div className="mx-auto max-w-[820px] space-y-2 px-4 pt-4 sm:px-6">
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
          )}
          {notice && (
            <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</p>
          )}
        </div>
      )}

      {settingsOpen && (
        <div className="border-b border-black/5 bg-white">
          <div className="mx-auto max-w-[820px] space-y-4 px-4 py-6 sm:px-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ploy-text-tertiary)]">
                Story settings
              </h2>
              <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Close settings">
                <X className="size-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1 text-sm">
                <span className="font-medium">Link name</span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase() }))}
                  className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
                  placeholder="your-article-slug"
                />
                <span className="text-xs text-[var(--ploy-text-tertiary)]">/insights/{form.slug || "…"}</span>
              </label>

              <label className="block space-y-1 text-sm">
                <span className="font-medium">Category</span>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
                >
                  {INSIGHT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1 text-sm">
                <span className="font-medium">Publish date</span>
                <input
                  type="date"
                  value={form.publishedAt}
                  onChange={(e) => setForm((p) => ({ ...p, publishedAt: e.target.value }))}
                  className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="font-medium">Sort order</span>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))}
                  className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
                />
              </label>
            </div>

            {seoSchemaReady && (
              <label className="block space-y-1 text-sm">
                <span className="font-medium">Search description</span>
                <textarea
                  value={form.seoDescription}
                  onChange={(e) => setForm((p) => ({ ...p, seoDescription: e.target.value }))}
                  rows={2}
                  maxLength={320}
                  className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
                  placeholder="Optional; summary used when blank"
                />
              </label>
            )}

            {mediaSchemaReady && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1 text-sm">
                  <span className="font-medium">Original source label</span>
                  <input
                    value={form.sourceLabel}
                    onChange={(e) => setForm((p) => ({ ...p, sourceLabel: e.target.value }))}
                    className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
                    placeholder="Forbes Business Council"
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="font-medium">Original source URL</span>
                  <input
                    type="url"
                    value={form.sourceUrl}
                    onChange={(e) => setForm((p) => ({ ...p, sourceUrl: e.target.value }))}
                    className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
                    placeholder="https://…"
                  />
                </label>
              </div>
            )}

            {isApprover && (
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.isHomepageFeatured}
                  onChange={(e) => setForm((p) => ({ ...p, isHomepageFeatured: e.target.checked }))}
                  className="mt-1"
                />
                <span>
                  Feature on homepage (up to {MAX_HOMEPAGE_FEATURED_INSIGHTS} articles)
                </span>
              </label>
            )}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[680px] px-4 py-10 sm:px-6 sm:py-14">
        {!schemaReady && (
          <p className="mb-6 text-sm text-amber-800">Insights schema not ready — run migration 010 in Supabase.</p>
        )}

        {mediaSchemaReady && (
          <div className="mb-10 space-y-3">
            <label className="group block cursor-pointer">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)}
              />
              {heroPreview ? (
                <div className="relative overflow-hidden rounded-lg">
                  <img src={heroPreview} alt="" className="aspect-[16/9] w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                    <span className="rounded-full bg-white px-4 py-2 text-sm font-medium">Change cover</span>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-[16/9] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-black/10 bg-white/50 text-[var(--ploy-text-tertiary)] transition hover:border-black/20 hover:bg-white">
                  <ImagePlus className="size-8" />
                  <span className="text-sm">Add a cover image</span>
                  <span className="max-w-xs px-4 text-center text-xs">{INSIGHT_HERO_IMAGE_HINT}</span>
                </div>
              )}
            </label>
            {heroPreview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setHeroFile(null);
                  setExistingHeroPath(null);
                }}
              >
                <X className="size-4" />
                Remove cover image
              </Button>
            )}
          </div>
        )}

        <input
          value={form.title}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              title: e.target.value,
              slug: p.slug || slugifyInsightTitle(e.target.value),
            }))
          }
          placeholder="Title"
          className={cn(
            "mb-4 w-full border-0 bg-transparent font-serif text-4xl font-bold leading-tight",
            "placeholder:text-[var(--ploy-text-tertiary)] focus:outline-none sm:text-[2.75rem]",
          )}
        />

        <textarea
          value={form.summary}
          onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
          placeholder="Write a subtitle or short summary…"
          rows={2}
          className={cn(
            "mb-10 w-full resize-none border-0 bg-transparent text-xl leading-relaxed",
            "text-[var(--ploy-text-secondary)] placeholder:text-[var(--ploy-text-tertiary)] focus:outline-none",
          )}
        />

        <MediumRichTextEditor
          id="insight-medium-body"
          value={form.body}
          onChange={(body) => setForm((p) => ({ ...p, body }))}
        />

        <details className="mt-12 rounded-lg border border-black/5 bg-white/60">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-[var(--ploy-text-secondary)]">
            <ChevronDown className="size-4" />
            Social preview
          </summary>
          <div className="border-t border-black/5 p-4">
            {heroPreview && (
              <img src={heroPreview} alt="" className="mb-3 aspect-[1.91/1] w-full rounded-md object-cover" />
            )}
            <p className="font-semibold">{form.title || "Article title"}</p>
            <p className="mt-1 line-clamp-2 text-sm text-[var(--ploy-text-secondary)]">
              {form.seoDescription || form.summary || "Description"}
            </p>
          </div>
        </details>
      </main>

      <AdminInsightPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        article={previewArticle}
      />
    </div>
  );
}
