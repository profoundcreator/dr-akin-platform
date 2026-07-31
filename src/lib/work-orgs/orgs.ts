import { isSupabaseConfigured, tryGetSupabaseClient } from "@/lib/supabase/client";
import type { DbWorkOrg, EventBrand, WorkOrgStatus } from "@/lib/supabase/database.types";
import type { PlatformWorkOrg, WorkOrgInput, WorkOrgLink, WorkOrgSection } from "@/lib/work-orgs/types";
import { formatSchemaSetupError } from "@/lib/site-settings/schema-support";

function parseSections(value: unknown): WorkOrgSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is WorkOrgSection => {
      if (!item || typeof item !== "object") return false;
      const section = item as WorkOrgSection;
      return typeof section.title === "string" && typeof section.body === "string";
    })
    .map((section) => ({
      title: section.title.trim(),
      body: section.body.trim(),
      bullets: Array.isArray(section.bullets)
        ? section.bullets.map((bullet) => String(bullet).trim()).filter(Boolean)
        : undefined,
    }))
    .filter((section) => section.title && section.body);
}

function parseLinks(value: unknown): WorkOrgLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is WorkOrgLink => {
      if (!item || typeof item !== "object") return false;
      const link = item as WorkOrgLink;
      return typeof link.label === "string" && typeof link.href === "string";
    })
    .map((link) => ({ label: link.label.trim(), href: link.href.trim() }))
    .filter((link) => link.label && link.href);
}

export function getWorkOrgHeroUrl(heroImagePath: string | null): string | null {
  if (!heroImagePath) return null;
  if (heroImagePath.startsWith("http://") || heroImagePath.startsWith("https://")) {
    return heroImagePath;
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? "";
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/storage/v1/object/public/work-org-assets/${heroImagePath}`;
}

function mapRow(row: DbWorkOrg): PlatformWorkOrg {
  return {
    id: row.id,
    slug: row.slug,
    brandKey: row.brand_key as EventBrand,
    pageTitle: row.page_title,
    pillarTitle: row.pillar_title,
    brandLabel: row.brand_label,
    kicker: row.kicker,
    headline: row.headline,
    headlineSecondary: row.headline_secondary,
    description: row.description,
    hubCardDescription: row.hub_card_description,
    sections: parseSections(row.sections),
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    secondaryCtaLabel: row.secondary_cta_label,
    secondaryCtaHref: row.secondary_cta_href,
    relatedLinks: parseLinks(row.related_links),
    heroImagePath: row.hero_image_path,
    logoImagePath: row.logo_image_path,
    externalUrl: row.external_url,
    sortOrder: row.sort_order,
    status: row.status,
    manuallyHidden: row.manually_hidden,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function slugifyWorkOrgTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
}

export function isValidWorkOrgSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim());
}

function isPublicOrg(org: PlatformWorkOrg): boolean {
  return org.status === "published" && !org.manuallyHidden;
}

export async function getPublishedWorkOrgsFromDb(): Promise<PlatformWorkOrg[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("work_orgs")
    .select("*")
    .eq("status", "published")
    .eq("manually_hidden", false)
    .order("sort_order", { ascending: true })
    .order("pillar_title", { ascending: true });

  if (error) return [];
  return (data ?? []).map(mapRow).filter(isPublicOrg);
}

export async function getWorkOrgBySlugFromDb(slug: string): Promise<PlatformWorkOrg | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = tryGetSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("work_orgs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  const org = mapRow(data);
  return isPublicOrg(org) ? org : null;
}

export async function getAdminWorkOrgs(): Promise<PlatformWorkOrg[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("work_orgs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("pillar_title", { ascending: true });

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return (data ?? []).map(mapRow);
}

export async function getPendingWorkOrgs(): Promise<PlatformWorkOrg[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("work_orgs")
    .select("*")
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false });

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return (data ?? []).map(mapRow);
}

export async function isPhase4SchemaReady(): Promise<boolean> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return false;

  const { error } = await supabase.from("work_orgs").select("id").limit(1);
  return !error;
}

function buildInsertPayload(
  input: WorkOrgInput,
  meta: {
    createdBy?: string;
    submittedBy?: string;
    approvedBy?: string;
    approvedAt?: string;
  },
): Record<string, unknown> {
  return {
    slug: input.slug.trim().toLowerCase(),
    brand_key: input.brandKey,
    page_title: input.pageTitle.trim(),
    pillar_title: input.pillarTitle.trim(),
    brand_label: input.brandLabel.trim(),
    kicker: input.kicker.trim(),
    headline: input.headline.trim(),
    headline_secondary: input.headlineSecondary?.trim() || null,
    description: input.description.trim(),
    hub_card_description: input.hubCardDescription.trim(),
    sections: input.sections ?? [],
    cta_label: input.ctaLabel?.trim() || null,
    cta_href: input.ctaHref?.trim() || null,
    secondary_cta_label: input.secondaryCtaLabel?.trim() || null,
    secondary_cta_href: input.secondaryCtaHref?.trim() || null,
    related_links: input.relatedLinks ?? [],
    hero_image_path: input.heroImagePath ?? null,
    logo_image_path: input.logoImagePath ?? null,
    external_url: input.externalUrl?.trim() || null,
    sort_order: input.sortOrder ?? 0,
    status: input.status ?? "draft",
    manually_hidden: input.manuallyHidden ?? false,
    created_by: meta.createdBy ?? null,
    submitted_by: meta.submittedBy ?? null,
    approved_by: meta.approvedBy ?? null,
    approved_at: meta.approvedAt ?? null,
  };
}

export async function createWorkOrg(
  input: WorkOrgInput,
  options: {
    createdBy?: string;
    submitForApproval?: boolean;
    publishDirectly?: boolean;
    approverId?: string;
  } = {},
): Promise<PlatformWorkOrg> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  let status: WorkOrgStatus = input.status ?? "draft";
  let approvedBy: string | undefined;
  let approvedAt: string | undefined;
  let submittedBy: string | undefined;

  if (options.publishDirectly) {
    status = "published";
    approvedBy = options.approverId;
    approvedAt = new Date().toISOString();
  } else if (options.submitForApproval) {
    status = "pending_approval";
    submittedBy = options.createdBy;
  }

  const { data, error } = await supabase
    .from("work_orgs")
    .insert(
      buildInsertPayload({ ...input, status }, {
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

export async function updateWorkOrg(
  id: string,
  input: Partial<WorkOrgInput> & {
    status?: WorkOrgStatus;
    rejectionNote?: string | null;
    approvedBy?: string | null;
    approvedAt?: string | null;
    submittedBy?: string | null;
  },
): Promise<PlatformWorkOrg> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const payload: Record<string, unknown> = {};
  if (input.slug !== undefined) payload.slug = input.slug.trim().toLowerCase();
  if (input.brandKey !== undefined) payload.brand_key = input.brandKey;
  if (input.pageTitle !== undefined) payload.page_title = input.pageTitle.trim();
  if (input.pillarTitle !== undefined) payload.pillar_title = input.pillarTitle.trim();
  if (input.brandLabel !== undefined) payload.brand_label = input.brandLabel.trim();
  if (input.kicker !== undefined) payload.kicker = input.kicker.trim();
  if (input.headline !== undefined) payload.headline = input.headline.trim();
  if (input.headlineSecondary !== undefined) payload.headline_secondary = input.headlineSecondary.trim() || null;
  if (input.description !== undefined) payload.description = input.description.trim();
  if (input.hubCardDescription !== undefined) payload.hub_card_description = input.hubCardDescription.trim();
  if (input.sections !== undefined) payload.sections = input.sections;
  if (input.ctaLabel !== undefined) payload.cta_label = input.ctaLabel.trim() || null;
  if (input.ctaHref !== undefined) payload.cta_href = input.ctaHref.trim() || null;
  if (input.secondaryCtaLabel !== undefined) payload.secondary_cta_label = input.secondaryCtaLabel.trim() || null;
  if (input.secondaryCtaHref !== undefined) payload.secondary_cta_href = input.secondaryCtaHref.trim() || null;
  if (input.relatedLinks !== undefined) payload.related_links = input.relatedLinks;
  if (input.heroImagePath !== undefined) payload.hero_image_path = input.heroImagePath;
  if (input.logoImagePath !== undefined) payload.logo_image_path = input.logoImagePath;
  if (input.externalUrl !== undefined) payload.external_url = input.externalUrl.trim() || null;
  if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
  if (input.status !== undefined) payload.status = input.status;
  if (input.manuallyHidden !== undefined) payload.manually_hidden = input.manuallyHidden;
  if (input.rejectionNote !== undefined) payload.rejection_note = input.rejectionNote;
  if (input.approvedBy !== undefined) payload.approved_by = input.approvedBy;
  if (input.approvedAt !== undefined) payload.approved_at = input.approvedAt;
  if (input.submittedBy !== undefined) payload.submitted_by = input.submittedBy;

  const { data, error } = await supabase
    .from("work_orgs")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(formatSchemaSetupError(error.message));
  return mapRow(data);
}

export async function deleteWorkOrgPermanently(id: string): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("work_orgs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function logWorkOrgAudit(
  eventType: string,
  targetId: string,
  summary: Record<string, unknown>,
): Promise<void> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return;

  await supabase.rpc("log_audit_event", {
    p_event_type: eventType,
    p_target_type: "work_org",
    p_target_id: targetId,
    p_summary: summary,
  });
}

export function workOrgsToCsv(orgs: PlatformWorkOrg[]): string {
  const headers = ["Title", "Slug", "Brand", "Status", "Sort order", "Created"];
  const rows = orgs.map((org) =>
    [
      org.pillarTitle,
      org.slug,
      org.brandLabel,
      org.status,
      org.sortOrder,
      org.createdAt,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}
