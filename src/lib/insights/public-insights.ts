import { INSIGHT_ARTICLES, type InsightArticle } from "@/data/site-content";
import { mergePublishedWithStatic } from "@/lib/content/merge-published-with-static";
import { getPreloadedContentSettings } from "@/lib/content/preloaded-content";
import {
  getInsightBySlugFromDb,
  getPublishedInsightsFromDb,
} from "@/lib/insights/articles";
import { plainTextToInsightHtml } from "@/lib/insights/sanitize-html";
import { MAX_HOMEPAGE_FEATURED_INSIGHTS } from "@/lib/insights/constants";
import type { PlatformInsight } from "@/lib/insights/types";

function staticInsightToPlatform(article: InsightArticle): PlatformInsight {
  return {
    id: `static-${article.slug}`,
    slug: article.slug,
    title: article.title,
    category: article.category,
    summary: article.summary,
    body: plainTextToInsightHtml(article.body),
    heroImagePath: null,
    heroImageUrl: null,
    sourceLabel: null,
    sourceUrl: null,
    publishedAt: article.date ? new Date(article.date).toISOString() : null,
    sortOrder: 0,
    isHomepageFeatured: false,
    homepageFeatureOrder: null,
    status: "published",
    manuallyHidden: false,
    createdAt: article.date ? new Date(article.date).toISOString() : new Date(0).toISOString(),
    updatedAt: article.date ? new Date(article.date).toISOString() : new Date(0).toISOString(),
  };
}

const STATIC_INSIGHTS = INSIGHT_ARTICLES.map(staticInsightToPlatform);

export const PRELOADED_INSIGHTS = STATIC_INSIGHTS;

function sortByPublishedDesc(insights: PlatformInsight[]): PlatformInsight[] {
  return [...insights].sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime || a.title.localeCompare(b.title);
  });
}

export type PublicInsightSource = "database" | "static";

export interface LiveSiteInsight extends PlatformInsight {
  source: PublicInsightSource;
  /** Real CMS record id when the article is managed in Supabase. */
  cmsId: string | null;
}

function withLiveMetadata(
  insight: PlatformInsight,
  source: PublicInsightSource,
): LiveSiteInsight {
  return {
    ...insight,
    source,
    cmsId: source === "database" ? insight.id : null,
  };
}

/** Articles visitors see on /insights — CMS overrides static by slug. */
export async function getInsightsLiveOnSite(): Promise<LiveSiteInsight[]> {
  const [fromDb, preloaded] = await Promise.all([
    getPublishedInsightsFromDb(),
    getPreloadedContentSettings(),
  ]);
  const merged = sortByPublishedDesc(
    mergePublishedWithStatic(fromDb, STATIC_INSIGHTS, preloaded.hiddenInsightSlugs),
  );
  return merged.map((insight) =>
    withLiveMetadata(
      insight,
      fromDb.some((item) => item.slug === insight.slug) ? "database" : "static",
    ),
  );
}

/** Up to three articles shown in the homepage Insights section. */
export async function getHomepageFeaturedInsightsLiveOnSite(): Promise<LiveSiteInsight[]> {
  const insights = await getInsightsLiveOnSite();
  const explicitlyFeatured = insights
    .filter((insight) => insight.isHomepageFeatured)
    .sort(
      (a, b) =>
        (a.homepageFeatureOrder ?? 99) - (b.homepageFeatureOrder ?? 99) ||
        (b.publishedAt ? new Date(b.publishedAt).getTime() : 0) -
          (a.publishedAt ? new Date(a.publishedAt).getTime() : 0),
    );

  if (explicitlyFeatured.length > 0) {
    return explicitlyFeatured.slice(0, MAX_HOMEPAGE_FEATURED_INSIGHTS);
  }

  return insights.slice(0, MAX_HOMEPAGE_FEATURED_INSIGHTS);
}

export async function getPublicInsights(): Promise<PlatformInsight[]> {
  const [fromDb, preloaded] = await Promise.all([
    getPublishedInsightsFromDb(),
    getPreloadedContentSettings(),
  ]);
  return sortByPublishedDesc(
    mergePublishedWithStatic(fromDb, STATIC_INSIGHTS, preloaded.hiddenInsightSlugs),
  );
}

export async function getPublicInsightBySlug(slug: string): Promise<PlatformInsight | null> {
  const fromDb = await getInsightBySlugFromDb(slug);
  if (fromDb) return fromDb;
  return STATIC_INSIGHTS.find((insight) => insight.slug === slug) ?? null;
}

export async function getPublicHomepageInsights(): Promise<PlatformInsight[]> {
  const featured = await getHomepageFeaturedInsightsLiveOnSite();
  return featured;
}
