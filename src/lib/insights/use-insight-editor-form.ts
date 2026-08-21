import { useCallback, useState } from "react";
import { INSIGHT_CATEGORIES } from "@/lib/insights/constants";
import {
  clearInsightHomepageFeatured,
  createInsight,
  getInsightHeroUrl,
  isValidInsightSlug,
  logInsightAudit,
  setInsightHomepageFeatured,
  slugifyInsightTitle,
  updateInsight,
} from "@/lib/insights/articles";
import { uploadInsightHeroImage } from "@/lib/insights/hero-image-upload";
import type { InsightInput, PlatformInsight } from "@/lib/insights/types";
import type { InsightArticleStatus } from "@/lib/supabase/database.types";
import { triggerSiteRebuild } from "@/lib/events/trigger-rebuild";
import { publishNoticeWithRebuild } from "@/lib/events/publish-notice";

export const EMPTY_INSIGHT_FORM = {
  slug: "",
  title: "",
  category: INSIGHT_CATEGORIES[0],
  summary: "",
  seoDescription: "",
  body: "",
  socialImageAlt: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  isHomepageFeatured: false,
  sortOrder: 0,
  sourceLabel: "",
  sourceUrl: "",
};

export type InsightFormState = typeof EMPTY_INSIGHT_FORM;

export function toPublishedAtIso(dateValue: string): string | null {
  if (!dateValue.trim()) return null;
  return new Date(`${dateValue}T12:00:00`).toISOString();
}

export function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function insightToForm(insight: PlatformInsight): InsightFormState {
  return {
    slug: insight.slug,
    title: insight.title,
    category: insight.category,
    summary: insight.summary,
    seoDescription: insight.seoDescription ?? "",
    body: insight.body,
    socialImageAlt: insight.socialImageAlt ?? "",
    publishedAt: toDateInputValue(insight.publishedAt),
    isHomepageFeatured: insight.isHomepageFeatured,
    sortOrder: insight.sortOrder,
    sourceLabel: insight.sourceLabel ?? "",
    sourceUrl: insight.sourceUrl ?? "",
  };
}

interface UseInsightEditorOptions {
  editingId: string | null;
  profileId?: string;
  profileName?: string;
  isApprover: boolean;
  mediaSchemaReady: boolean;
  seoSchemaReady: boolean;
  existingHeroPath: string | null;
  heroFile: File | null;
}

export function useInsightEditorSave({
  editingId,
  profileId,
  profileName,
  isApprover,
  mediaSchemaReady,
  seoSchemaReady,
  existingHeroPath,
  heroFile,
}: UseInsightEditorOptions) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const buildInput = useCallback(
    async (form: InsightFormState, status?: InsightArticleStatus): Promise<InsightInput> => {
      const slug = form.slug.trim().toLowerCase() || slugifyInsightTitle(form.title);

      if (!form.title.trim()) throw new Error("Article title is required.");
      if (!form.summary.trim()) throw new Error("Summary is required.");
      if (!form.body.trim()) throw new Error("Body is required.");
      if (!isValidInsightSlug(slug)) {
        throw new Error("Link name must use lowercase letters, numbers, and hyphens only.");
      }

      let heroImagePath = existingHeroPath;
      if (heroFile && mediaSchemaReady) {
        heroImagePath = await uploadInsightHeroImage(heroFile, slug);
      }

      return {
        slug,
        title: form.title,
        category: form.category,
        summary: form.summary,
        body: form.body,
        heroImagePath,
        ...(seoSchemaReady
          ? {
              seoDescription: form.seoDescription.trim() || null,
              socialImageAlt: form.socialImageAlt.trim() || null,
            }
          : {}),
        sourceLabel: form.sourceLabel.trim() || null,
        sourceUrl: form.sourceUrl.trim() || null,
        publishedAt: toPublishedAtIso(form.publishedAt),
        sortOrder: form.sortOrder,
        status,
      };
    },
    [existingHeroPath, heroFile, mediaSchemaReady, seoSchemaReady],
  );

  const saveInsight = useCallback(
    async (form: InsightFormState, mode: "draft" | "submit" | "publish") => {
      setError(null);
      setNotice(null);
      setSaving(true);

      try {
        const input = await buildInput(
          form,
          mode === "publish" ? "published" : mode === "submit" ? "pending_approval" : "draft",
        );

        let saved: PlatformInsight;

        if (editingId) {
          saved = await updateInsight(editingId, {
            ...input,
            ...(mode === "publish"
              ? {
                  approvedBy: profileId ?? null,
                  approvedAt: new Date().toISOString(),
                  rejectionNote: null,
                  publishedAt: input.publishedAt ?? new Date().toISOString(),
                }
              : {}),
            ...(mode === "submit"
              ? {
                  submittedBy: profileId ?? null,
                  rejectionNote: null,
                }
              : {}),
          });
        } else if (mode === "publish" && isApprover) {
          saved = await createInsight(input, {
            createdBy: profileId,
            publishDirectly: true,
            approverId: profileId,
          });
        } else if (mode === "submit") {
          saved = await createInsight(input, {
            createdBy: profileId,
            submitForApproval: true,
          });
        } else {
          saved = await createInsight(input, { createdBy: profileId });
        }

        if (mode === "submit") {
          await logInsightAudit("insight_submitted_for_approval", saved.id, {
            title: saved.title,
            slug: saved.slug,
            submittedBy: profileName,
          });
          setNotice("Article submitted for approval.");
        }

        if (mode === "publish") {
          await logInsightAudit("insight_published", saved.id, {
            title: saved.title,
            slug: saved.slug,
            publishedBy: profileName,
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
            publishNotice = publishNoticeWithRebuild("Article published.", rebuild);
          }

          setNotice(publishNotice);
        }

        return saved;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save article";
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [buildInput, editingId, isApprover, profileId, profileName],
  );

  return { saveInsight, saving, error, notice, setError, setNotice };
}

export function getHeroPreview(heroFile: File | null, existingHeroPath: string | null): string | null {
  if (heroFile) return URL.createObjectURL(heroFile);
  return getInsightHeroUrl(existingHeroPath);
}
