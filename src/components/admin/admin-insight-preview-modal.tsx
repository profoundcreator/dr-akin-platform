"use client";

import { useEffect, useRef } from "react";
import { Eye, X } from "lucide-react";
import { InsightArticleBody } from "@/components/insights/insight-article-body";
import { Heading } from "@/components/ui/heading";
import { formatInsightDate } from "@/lib/insights/articles";
import { cn } from "@/lib/utils";

export interface InsightPreviewData {
  title: string;
  category: string;
  summary: string;
  body: string;
  publishedAt: string;
  slug: string;
}

interface AdminInsightPreviewModalProps {
  open: boolean;
  onClose: () => void;
  article: InsightPreviewData | null;
  bannerLabel?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function formatPreviewDate(publishedAt: string): string | null {
  if (!publishedAt.trim()) return null;
  const iso = publishedAt.includes("T") ? publishedAt : `${publishedAt}T12:00:00`;
  return formatInsightDate(iso);
}

export function AdminInsightPreviewModal({
  open,
  onClose,
  article,
  bannerLabel = "Admin preview — not on the public site yet",
}: AdminInsightPreviewModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const timer = setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open || !article) return null;

  const displayDate = formatPreviewDate(article.publishedAt);
  const publicPath = `/insights/${article.slug || "your-link"}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[oklch(0.21_0.005_70/0.55)] backdrop-blur-sm"
        aria-label="Close preview"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="insight-preview-title"
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-[var(--ploy-background-primary)] shadow-[var(--ploy-shadow-overlay)]",
          "rounded-t-[var(--ploy-radius-xl)] sm:max-w-3xl sm:rounded-[var(--ploy-radius-xl)]",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--ploy-border-subtle)] px-6 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[oklch(0.68_0.145_29/0.12)] text-[var(--ploy-accent-primary)]">
              <Eye className="size-4" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--ploy-accent-primary)]">
                {bannerLabel}
              </p>
              <p className="text-sm text-[var(--ploy-text-secondary)]">
                Public URL:{" "}
                <span className="font-medium text-[var(--ploy-text-primary)]">{publicPath}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)]"
            aria-label="Close preview"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <article className="mx-auto max-w-2xl space-y-8">
            <div className="space-y-4">
              <p className="ploy-kicker">{article.category || "Category"}</p>
              <Heading as="h1" id="insight-preview-title" size="section">
                {article.title || "Untitled article"}
              </Heading>
              {displayDate && (
                <p className="text-sm text-[var(--ploy-text-tertiary)]">{displayDate}</p>
              )}
            </div>

            {article.summary.trim() && (
              <div className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] p-4">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--ploy-text-tertiary)]">
                  Card summary (insights list & homepage)
                </p>
                <p className="mt-2 leading-relaxed text-[var(--ploy-text-secondary)]">
                  {article.summary}
                </p>
              </div>
            )}

            <InsightArticleBody html={article.body} />
          </article>
        </div>
      </div>
    </div>
  );
}
