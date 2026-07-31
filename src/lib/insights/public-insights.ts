import { INSIGHT_ARTICLES, type InsightArticle } from "@/data/site-content";
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

/** Articles visitors see on /insights — DB wins when any are published. */
export async function getInsightsLiveOnSite(): Promise<LiveSiteInsight[]> {
  const fromDb = await getPublishedInsightsFromDb();
  if (fromDb.length > 0) {
    return sortByPublishedDesc(fromDb).map((insight) =>
      withLiveMetadata(insight, "database"),
    );
  }
  return sortByPublishedDesc(STATIC_INSIGHTS).map((insight) =>
    withLiveMetadata(insight, "static"),
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
  const fromDb = await getPublishedInsightsFromDb();
  if (fromDb.length > 0) return sortByPublishedDesc(fromDb);
  return sortByPublishedDesc(STATIC_INSIGHTS);
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
