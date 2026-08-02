import type { DbInsightArticle } from "@/lib/supabase/database.types";
import { INSIGHT_ARTICLES, type InsightArticle } from "@/data/site-content";
import { getInsightHeroUrl } from "@/lib/insights/articles";
import { mergePublishedWithStatic } from "@/lib/content/merge-published-with-static";
import { fetchPreloadedContentSettingsForBuild } from "@/lib/content/preloaded-content";
import { plainTextToInsightHtml } from "@/lib/insights/sanitize-html";
import type { PlatformInsight } from "@/lib/insights/types";
import {
  isSupabaseBuildEnvConfigured,
  warnIfSupabaseBuildEnvMissing,
} from "@/lib/build/supabase-build-env";

function mapBuildRow(row: DbInsightArticle): PlatformInsight {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    seoDescription: row.seo_description ?? null,
    body: row.body,
    heroImagePath: row.hero_image_path,
    heroImageUrl: getInsightHeroUrl(row.hero_image_path),
    socialImageAlt: row.social_image_alt ?? null,
    sourceLabel: row.source_label,
    sourceUrl: row.source_url,
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
    seoDescription: null,
    body: plainTextToInsightHtml(article.body),
    heroImagePath: null,
    heroImageUrl: null,
    socialImageAlt: null,
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

export async function fetchPublishedInsightsForBuild(): Promise<PlatformInsight[]> {
  if (!isSupabaseBuildEnvConfigured()) {
    warnIfSupabaseBuildEnvMissing("insights static paths");
    return [];
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? "";

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
  const [fromDb, preloaded] = await Promise.all([
    fetchPublishedInsightsForBuild(),
    fetchPreloadedContentSettingsForBuild(),
  ]);
  const staticInsights = getStaticInsightPaths();
  return mergePublishedWithStatic(fromDb, staticInsights, preloaded.hiddenInsightSlugs).sort(
    (a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime || a.title.localeCompare(b.title);
    },
  );
}
