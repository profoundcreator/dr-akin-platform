import { isSupabaseConfigured, tryGetSupabaseClient } from "@/lib/supabase/client";
import {
  AALD_PERFORMX_PLAN_SEED,
  AALD_PERFORMX_PLAN_SLUG,
} from "@/lib/content-plans/aald-performx-seed";
import type {
  ContentPlanData,
  ContentPlanReadiness,
  ContentPlanStatus,
  PlanChecklistItem,
  PlanDecision,
  PlanVariable,
  SectionApprovalStatus,
} from "@/lib/content-plans/types";

interface DbContentPlan {
  slug: string;
  title: string;
  variables: Record<string, PlanVariable>;
  decisions: Record<string, PlanDecision>;
  section_approvals: Record<string, SectionApprovalStatus>;
  checklist: Record<string, PlanChecklistItem>;
  pages: ContentPlanData["pages"];
  status: ContentPlanStatus;
  approval_note: string;
  updated_by: string | null;
  updated_at: string;
}

function mapRow(row: DbContentPlan): ContentPlanData {
  return {
    slug: row.slug,
    title: row.title,
    variables: row.variables ?? {},
    decisions: row.decisions ?? {},
    sectionApprovals: row.section_approvals ?? {},
    checklist: row.checklist ?? {},
    pages: row.pages ?? AALD_PERFORMX_PLAN_SEED.pages,
    status: row.status,
    approvalNote: row.approval_note ?? "",
    updatedAt: row.updated_at,
  };
}

function mergeWithSeed(partial: Partial<ContentPlanData>): ContentPlanData {
  return {
    ...AALD_PERFORMX_PLAN_SEED,
    ...partial,
    variables: { ...AALD_PERFORMX_PLAN_SEED.variables, ...partial.variables },
    decisions: { ...AALD_PERFORMX_PLAN_SEED.decisions, ...partial.decisions },
    sectionApprovals: {
      ...AALD_PERFORMX_PLAN_SEED.sectionApprovals,
      ...partial.sectionApprovals,
    },
    checklist: { ...AALD_PERFORMX_PLAN_SEED.checklist, ...partial.checklist },
    pages: partial.pages?.length ? partial.pages : AALD_PERFORMX_PLAN_SEED.pages,
  };
}

export function isContentPlansSchemaReady(): boolean {
  return isSupabaseConfigured;
}

export function computePlanReadiness(plan: ContentPlanData): ContentPlanReadiness {
  const pendingDecisions = Object.values(plan.decisions).filter((d) => !d.choice).length;
  const openChecklist = Object.values(plan.checklist).filter((c) => !c.checked).length;
  const holdVariables = Object.values(plan.variables).filter((v) => v.status === "hold").length;
  const pendingSections = plan.pages.flatMap((p) => p.sections).filter((s) => {
    const status = plan.sectionApprovals[s.id] ?? s.status;
    return status !== "approved";
  }).length;

  const allDecisionsMade = pendingDecisions === 0;
  const checklistComplete = openChecklist === 0;
  const noHolds = holdVariables === 0;

  return {
    pendingDecisions,
    openChecklist,
    holdVariables,
    pendingSections,
    ready: allDecisionsMade && checklistComplete && noHolds,
  };
}

export async function getContentPlan(slug: string): Promise<ContentPlanData | null> {
  if (!isSupabaseConfigured) {
    if (slug === AALD_PERFORMX_PLAN_SLUG) return AALD_PERFORMX_PLAN_SEED;
    return null;
  }

  const supabase = tryGetSupabaseClient();
  if (!supabase) return slug === AALD_PERFORMX_PLAN_SLUG ? AALD_PERFORMX_PLAN_SEED : null;

  const { data, error } = await supabase
    .from("content_plans")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01" || error.message.includes("content_plans")) {
      return slug === AALD_PERFORMX_PLAN_SLUG ? AALD_PERFORMX_PLAN_SEED : null;
    }
    throw error;
  }

  if (!data) return null;

  const mapped = mapRow(data as DbContentPlan);
  const needsSeedMerge =
    Object.keys(mapped.variables).length === 0 ||
    Object.keys(mapped.decisions).length === 0 ||
    mapped.pages.length === 0;

  return needsSeedMerge && slug === AALD_PERFORMX_PLAN_SLUG
    ? mergeWithSeed(mapped)
    : mapped;
}

export async function ensureContentPlan(slug: string): Promise<ContentPlanData> {
  const existing = await getContentPlan(slug);
  if (existing) return existing;

  if (!isSupabaseConfigured) {
    return AALD_PERFORMX_PLAN_SEED;
  }

  const supabase = tryGetSupabaseClient();
  if (!supabase) return AALD_PERFORMX_PLAN_SEED;

  const seed = slug === AALD_PERFORMX_PLAN_SLUG ? AALD_PERFORMX_PLAN_SEED : null;
  if (!seed) throw new Error(`No seed for plan slug: ${slug}`);

  const payload = {
    slug: seed.slug,
    title: seed.title,
    variables: seed.variables,
    decisions: seed.decisions,
    section_approvals: seed.sectionApprovals,
    checklist: seed.checklist,
    pages: seed.pages,
    status: seed.status,
    approval_note: seed.approvalNote,
  };

  const { data, error } = await supabase
    .from("content_plans")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as DbContentPlan);
}

export async function saveContentPlan(
  plan: ContentPlanData,
  updatedBy?: string,
): Promise<ContentPlanData> {
  if (!isSupabaseConfigured) {
    return plan;
  }

  const supabase = tryGetSupabaseClient();
  if (!supabase) return plan;

  const payload = {
    title: plan.title,
    variables: plan.variables,
    decisions: plan.decisions,
    section_approvals: plan.sectionApprovals,
    checklist: plan.checklist,
    pages: plan.pages,
    status: plan.status,
    approval_note: plan.approvalNote,
    updated_by: updatedBy ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("content_plans")
    .update(payload)
    .eq("slug", plan.slug)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as DbContentPlan);
}

export async function approveContentPlan(
  plan: ContentPlanData,
  updatedBy?: string,
): Promise<ContentPlanData> {
  const readiness = computePlanReadiness(plan);
  if (!readiness.ready && !plan.approvalNote.trim()) {
    throw new Error(
      "Plan is not ready for approval. Complete all decisions and checklist items, or add an approval note with exceptions.",
    );
  }

  return saveContentPlan(
    { ...plan, status: "approved" },
    updatedBy,
  );
}

export async function logContentPlanAudit(
  action: string,
  planSlug: string,
  actorId?: string,
) {
  if (!isSupabaseConfigured) return;
  const supabase = tryGetSupabaseClient();
  if (!supabase) return;

  await supabase.rpc("log_audit_event", {
    p_event_type: action,
    p_target_type: "content_plan",
    p_summary: { slug: planSlug },
    p_metadata: actorId ? { actorId } : undefined,
  });
}
