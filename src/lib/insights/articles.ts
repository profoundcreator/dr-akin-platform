import { isSupabaseConfigured, tryGetSupabaseClient } from "@/lib/supabase/client";
import type { DbInsightArticle, InsightArticleStatus } from "@/lib/supabase/database.types";
import { MAX_HOMEPAGE_FEATURED_INSIGHTS } from "@/lib/insights/constants";
import { plainTextToInsightHtml, sanitizeInsightHtml } from "@/lib/insights/sanitize-html";
import type { InsightInput, PlatformInsight } from "@/lib/insights/types";
import { formatSchemaSetupError } from "@/lib/site-settings/schema-support";

export function getInsightHeroUrl(heroImagePath: string | null): string | null {
  if (!heroImagePath) return null;
  if (
    heroImagePath.startsWith("http://") ||
    heroImagePath.startsWith("https://") ||
    heroImagePath.startsWith("/")
  ) {
    return heroImagePath;
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/insight-images/${heroImagePath}`;
}

function mapRow(row: DbInsightArticle): PlatformInsight {
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

export function slugifyInsightTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
}

export function isValidInsightSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());
}

function isPublicInsight(insight: PlatformInsight): boolean {
  return insight.status === "published" && !insight.manuallyHidden;
}

function sortPublishedInsights(insights: PlatformInsight[]): PlatformInsight[] {
  return [...insights].sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime || a.sortOrder - b.sortOrder || a.title.localeCompare(b.title);
  });
}

export async function getPublishedInsightsFromDb(): Promise<PlatformInsight[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("insights_articles")
    .select("*")
    .eq("status", "published")
    .eq("manually_hidden", false);

  if (error) return [];
  return sortPublishedInsights((data ?? []).map(mapRow).filter(isPublicInsight));
}

export async function getInsightBySlugFromDb(slug: string): Promise<PlatformInsight | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = tryGetSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("insights_articles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  const insight = mapRow(data);
  return isPublicInsight(insight) ? insight : null;
}

export async function getAdminInsights(): Promise<PlatformInsight[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("insights_articles")
    .select("*");

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return sortPublishedInsights((data ?? []).map(mapRow));
}

export async function getInsightById(id: string): Promise<PlatformInsight | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = tryGetSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("insights_articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data);
}

export async function getPendingInsights(): Promise<PlatformInsight[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("insights_articles")
    .select("*")
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false });

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return (data ?? []).map(mapRow);
}

export async function isPhase3SchemaReady(): Promise<boolean> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from("insights_articles").select("id").limit(1);
  return !error;
}

export async function isInsightMediaSchemaReady(): Promise<boolean> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from("insights_articles").select("hero_image_path").limit(1);
  return !error;
}

export async function isInsightSeoSchemaReady(): Promise<boolean> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase
    .from("insights_articles")
    .select("seo_description, social_image_alt")
    .limit(1);
  return !error;
}

function normalizeBody(body: string): string {
  return sanitizeInsightHtml(plainTextToInsightHtml(body));
}

function buildInsertPayload(
  input: InsightInput,
  meta: {
    createdBy?: string;
    submittedBy?: string;
    approvedBy?: string;
    approvedAt?: string;
  },
): Record<string, unknown> {
  return {
    slug: input.slug.trim().toLowerCase(),
    title: input.title.trim(),
    category: input.category.trim(),
    summary: input.summary.trim(),
    body: normalizeBody(input.body),
    hero_image_path: input.heroImagePath ?? null,
    ...("seoDescription" in input
      ? { seo_description: input.seoDescription?.trim() || null }
      : {}),
    ...("socialImageAlt" in input
      ? { social_image_alt: input.socialImageAlt?.trim() || null }
      : {}),
    source_label: input.sourceLabel?.trim() || null,
    source_url: input.sourceUrl?.trim() || null,
    published_at: input.publishedAt ?? null,
    sort_order: input.sortOrder ?? 0,
    is_homepage_featured: false,
    homepage_feature_order: null,
    status: input.status ?? "draft",
    manually_hidden: input.manuallyHidden ?? false,
    created_by: meta.createdBy ?? null,
    submitted_by: meta.submittedBy ?? null,
    approved_by: meta.approvedBy ?? null,
    approved_at: meta.approvedAt ?? null,
  };
}

export async function createInsight(
  input: InsightInput,
  options: {
    createdBy?: string;
    submitForApproval?: boolean;
    publishDirectly?: boolean;
    approverId?: string;
  } = {},
): Promise<PlatformInsight> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  let status: InsightArticleStatus = input.status ?? "draft";
  let approvedBy: string | undefined;
  let approvedAt: string | undefined;
  let submittedBy: string | undefined;
  let publishedAt = input.publishedAt ?? null;

  if (options.publishDirectly) {
    status = "published";
    approvedBy = options.approverId;
    approvedAt = new Date().toISOString();
    publishedAt = publishedAt ?? new Date().toISOString();
  } else if (options.submitForApproval) {
    status = "pending_approval";
    submittedBy = options.createdBy;
  }

  const { data, error } = await supabase
    .from("insights_articles")
    .insert(
      buildInsertPayload({ ...input, status, publishedAt }, {
        createdBy: options.createdBy,
        submittedBy,
        approvedBy,
        approvedAt,
      }),
    )
    .select("*")
    .single();

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return mapRow(data);
}

export async function updateInsight(
  id: string,
  input: Partial<InsightInput> & {
    status?: InsightArticleStatus;
    rejectionNote?: string | null;
    approvedBy?: string | null;
    approvedAt?: string | null;
    submittedBy?: string | null;
    publishedAt?: string | null;
  },
): Promise<PlatformInsight> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const payload: Record<string, unknown> = {};
  if (input.slug !== undefined) payload.slug = input.slug.trim().toLowerCase();
  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.category !== undefined) payload.category = input.category.trim();
  if (input.summary !== undefined) payload.summary = input.summary.trim();
  if (input.seoDescription !== undefined) {
    payload.seo_description = input.seoDescription?.trim() || null;
  }
  if (input.body !== undefined) payload.body = normalizeBody(input.body);
  if (input.heroImagePath !== undefined) payload.hero_image_path = input.heroImagePath;
  if (input.socialImageAlt !== undefined) {
    payload.social_image_alt = input.socialImageAlt?.trim() || null;
  }
  if (input.sourceLabel !== undefined) payload.source_label = input.sourceLabel?.trim() || null;
  if (input.sourceUrl !== undefined) payload.source_url = input.sourceUrl?.trim() || null;
  if (input.publishedAt !== undefined) payload.published_at = input.publishedAt;
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
  if (input.status !== undefined) payload.status = input.status;
  if (input.manuallyHidden !== undefined) payload.manually_hidden = input.manuallyHidden;
  if (input.rejectionNote !== undefined) payload.rejection_note = input.rejectionNote;
  if (input.approvedBy !== undefined) payload.approved_by = input.approvedBy;
  if (input.approvedAt !== undefined) payload.approved_at = input.approvedAt;
  if (input.submittedBy !== undefined) payload.submitted_by = input.submittedBy;

  const { data, error } = await supabase
    .from("insights_articles")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return mapRow(data);
}

export async function deleteInsightPermanently(id: string): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("insights_articles").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

async function getFeaturedInsightCount(excludeId?: string): Promise<number> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  let query = supabase
    .from("insights_articles")
    .select("id", { count: "exact", head: true })
    .eq("is_homepage_featured", true);

  if (excludeId) query = query.neq("id", excludeId);

  const { count, error } = await query;
  if (error) throw new Error(formatSchemaSetupError(error.message));
  return count ?? 0;
}

async function nextHomepageFeatureOrder(): Promise<number> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("insights_articles")
    .select("homepage_feature_order")
    .eq("is_homepage_featured", true)
    .not("homepage_feature_order", "is", null);

  if (error) throw new Error(formatSchemaSetupError(error.message));

  const used = new Set((data ?? []).map((row) => row.homepage_feature_order).filter(Boolean));
  for (let slot = 1; slot <= MAX_HOMEPAGE_FEATURED_INSIGHTS; slot += 1) {
    if (!used.has(slot)) return slot;
  }

  throw new Error(
    `Homepage already has ${MAX_HOMEPAGE_FEATURED_INSIGHTS} featured articles. Unfeature one first.`,
  );
}

export async function setInsightHomepageFeatured(insightId: string): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const featuredCount = await getFeaturedInsightCount(insightId);
  if (featuredCount >= MAX_HOMEPAGE_FEATURED_INSIGHTS) {
    throw new Error(
      `Homepage already has ${MAX_HOMEPAGE_FEATURED_INSIGHTS} featured articles. Unfeature one first.`,
    );
  }

  const order = await nextHomepageFeatureOrder();

  const { error } = await supabase
    .from("insights_articles")
    .update({
      is_homepage_featured: true,
      homepage_feature_order: order,
    })
    .eq("id", insightId);

  if (error) throw new Error(formatSchemaSetupError(error.message));
}

export async function clearInsightHomepageFeatured(insightId: string): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("insights_articles")
    .update({
      is_homepage_featured: false,
      homepage_feature_order: null,
    })
    .eq("id", insightId);

  if (error) throw new Error(formatSchemaSetupError(error.message));
}

export async function logInsightAudit(
  eventType: string,
  targetId: string,
  summary: Record<string, unknown>,
): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return;

  await supabase.rpc("log_audit_event", {
    p_event_type: eventType,
    p_target_type: "insight_article",
    p_target_id: targetId,
    p_summary: summary,
  });
}

export function insightsToCsv(insights: PlatformInsight[]): string {
  const headers = ["Title", "Slug", "Category", "Status", "Featured", "Published", "Created"];
  const rows = insights.map((insight) =>
    [
      insight.title,
      insight.slug,
      insight.category,
      insight.status,
      insight.isHomepageFeatured ? "yes" : "no",
      insight.publishedAt ?? "",
      insight.createdAt,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export function formatInsightDate(publishedAt: string | null): string {
  if (!publishedAt) return "";
  return new Date(publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
