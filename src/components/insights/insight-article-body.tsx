"use client";

import { sanitizeInsightHtml } from "@/lib/insights/sanitize-html";
import { cn } from "@/lib/utils";

interface InsightArticleBodyProps {
  html: string;
  className?: string;
}

export function InsightArticleBody({ html, className }: InsightArticleBodyProps) {
  const safeHtml = sanitizeInsightHtml(html);

  if (!safeHtml) return null;

  return (
    <div
      className={cn(
        "prose-spacing space-y-4 text-lg leading-relaxed text-[var(--ploy-text-secondary)]",
        "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[var(--ploy-text-primary)]",
        "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[var(--ploy-text-primary)]",
        "[&_a]:underline [&_a]:underline-offset-4 [&_a]:text-[var(--ploy-text-primary)]",
        "[&_p]:leading-relaxed",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
