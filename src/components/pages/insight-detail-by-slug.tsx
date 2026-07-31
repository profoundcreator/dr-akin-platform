"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { InsightArticlePage } from "@/components/pages/marketing-page";
import { getPublicInsightBySlug } from "@/lib/insights/public-insights";
import type { PlatformInsight } from "@/lib/insights/types";
import { resolveContentSlug } from "@/lib/routing/resolve-content-slug";

interface InsightDetailBySlugProps {
  slug: string;
  /** Build-time snapshot for fast first paint; refreshed from Supabase on load. */
  initialInsight?: PlatformInsight | null;
}

function applyClientSeo(insight: PlatformInsight) {
  document.title = `${insight.title} — Insights`;

  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.setAttribute("content", insight.summary);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", `${insight.title} — Insights`);

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute("content", insight.summary);

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage && insight.heroImageUrl) {
    ogImage.setAttribute("content", insight.heroImageUrl);
  }
}

export function InsightDetailBySlug({ slug, initialInsight = null }: InsightDetailBySlugProps) {
  const [insight, setInsight] = useState<PlatformInsight | null>(initialInsight);
  const [loading, setLoading] = useState(!initialInsight);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const effectiveSlug = resolveContentSlug(slug, "insights", initialInsight?.slug);
    if (!effectiveSlug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    getPublicInsightBySlug(effectiveSlug)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          if (!initialInsight) setNotFound(true);
          return;
        }
        setInsight(data);
        applyClientSeo(data);
      })
      .catch(() => {
        if (!cancelled && !initialInsight) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, initialInsight]);

  if (loading) {
    return (
      <PageShell>
        <section className="px-6 py-24 md:px-10 lg:px-14 xl:px-20">
          <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading article…</p>
        </section>
      </PageShell>
    );
  }

  if (notFound || !insight) {
    return (
      <PageShell>
        <section className="px-6 py-24 md:px-10 lg:px-14 xl:px-20">
          <div className="mx-auto max-w-xl space-y-6">
            <Heading as="h1" size="section">Article not found</Heading>
            <p className="text-lg text-[var(--ploy-text-secondary)]">
              This article may have been moved or is not yet published.
            </p>
            <Button variant="secondary" href="/insights">
              Back to insights
            </Button>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <InsightArticlePage
      title={insight.title}
      category={insight.category}
      date={insight.publishedAt ?? insight.createdAt}
      body={insight.body}
      heroImageUrl={insight.heroImageUrl}
      sourceLabel={insight.sourceLabel}
      sourceUrl={insight.sourceUrl}
    />
  );
}
