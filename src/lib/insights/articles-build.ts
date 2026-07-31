import type { DbInsightArticle } from "@/lib/supabase/database.types";
import { INSIGHT_ARTICLES, type InsightArticle } from "@/data/site-content";
import { plainTextToInsightHtml } from "@/lib/insights/sanitize-html";
import type { PlatformInsight } from "@/lib/insights/types";

function mapBuildRow(row: DbInsightArticle): PlatformInsight {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    body: row.body,
    publishedAt: row.published_at,
    sortOrder: row.sort_order,
    isHomepageFeatured: row.is_homepage_featured ?? false,
    homepageFeatureOrder: row.homepage_feature_order,
    status: row.status,
    manuallyHidden: row.manually_hidden,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

export async function fetchPublishedInsightsForBuild(): Promise<PlatformInsight[]> {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";

  if (!supabaseUrl || !supabaseAnonKey) return [];

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/insights_articles?select=*&status=eq.published&manually_hidden=eq.false&order=published_at.desc,sort_order.asc`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      },
    );

    if (!response.ok) return [];
    const data = (await response.json()) as DbInsightArticle[];
    return data.map(mapBuildRow);
  } catch {
    return [];
  }
}

export function getStaticInsightPaths(): PlatformInsight[] {
  return INSIGHT_ARTICLES.map(staticInsightToPlatform);
}

export async function fetchAllInsightsForBuild(): Promise<PlatformInsight[]> {
  const fromDb = await fetchPublishedInsightsForBuild();
  if (fromDb.length > 0) return fromDb;
  return getStaticInsightPaths();
}
