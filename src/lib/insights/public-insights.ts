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
  const insights = await getPublicInsights();
  const featured = insights
    .filter((insight) => insight.isHomepageFeatured)
    .sort(
      (a, b) =>
        (a.homepageFeatureOrder ?? 99) - (b.homepageFeatureOrder ?? 99) ||
        (b.publishedAt ? new Date(b.publishedAt).getTime() : 0) -
          (a.publishedAt ? new Date(a.publishedAt).getTime() : 0),
    );

  if (featured.length > 0) {
    return featured.slice(0, MAX_HOMEPAGE_FEATURED_INSIGHTS);
  }

  return insights.slice(0, MAX_HOMEPAGE_FEATURED_INSIGHTS);
}
