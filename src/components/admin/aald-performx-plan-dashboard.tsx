"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  GitBranch,
  Layers,
  Lock,
  Save,
  SlidersHorizontal,
} from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminSetupNotice } from "@/components/admin/admin-setup-notice";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/context/admin-auth-provider";
import {
  canAccessContentPlans,
  canReviewContentPlans,
  isPrivilegedAdmin,
} from "@/lib/auth/permissions";
import { AALD_PERFORMX_PLAN_SLUG } from "@/lib/content-plans/aald-performx-seed";
import { downloadMarkdown, exportPlanToMarkdown } from "@/lib/content-plans/export-markdown";
import {
  approveContentPlan,
  computePlanReadiness,
  ensureContentPlan,
  logContentPlanAudit,
  saveContentPlan,
} from "@/lib/content-plans/plans";
import type {
  ContentPlanData,
  PlanVariable,
  PlanVariableStatus,
  SectionApprovalStatus,
} from "@/lib/content-plans/types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type TabId = "overview" | "variables" | "pages" | "decisions" | "approvals";

const TABS: { id: TabId; label: string; icon: typeof FileText }[] = [
  { id: "overview", label: "Overview", icon: Layers },
  { id: "variables", label: "Variables", icon: SlidersHorizontal },
  { id: "pages", label: "Page plans", icon: FileText },
  { id: "decisions", label: "Decisions", icon: GitBranch },
  { id: "approvals", label: "Approvals", icon: ClipboardList },
];

const STATUS_LABELS: Record<ContentPlanData["status"], string> = {
  draft: "Draft",
  pending_review: "Pending review",
  approved: "Approved",
};

function statusPillClass(status: ContentPlanData["status"]): string {
  if (status === "approved") return "bg-emerald-100 text-emerald-800";
  if (status === "pending_review") return "bg-amber-100 text-amber-900";
  return "bg-[var(--ploy-background-secondary)] text-[var(--ploy-text-secondary)]";
}

export function AaldPerformxPlanDashboard() {
  const { profile } = useAdminAuth();
  const isApprover = canReviewContentPlans(profile);
  const canView = canAccessContentPlans(profile);
  const isSuperAdmin = isPrivilegedAdmin(profile);
  const [plan, setPlan] = useState<ContentPlanData | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locked = plan?.status === "approved" && !isSuperAdmin;
  const readiness = useMemo(
    () => (plan ? computePlanReadiness(plan) : null),
    [plan],
  );

  const loadPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ensureContentPlan(AALD_PERFORMX_PLAN_SLUG);
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPlan();
  }, [loadPlan]);

  const persist = async (next: ContentPlanData, approve = false) => {
    if (locked) return;
    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      const saved = approve
        ? await approveContentPlan(next, profile?.id)
        : await saveContentPlan(next, profile?.id);
      setPlan(saved);
      if (approve) {
        await logContentPlanAudit("content_plan.approved", saved.slug, profile?.id);
        setNotice("Plan marked approved. CMS implementation can proceed.");
      } else {
        setNotice("Draft saved.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const updateVariable = (key: string, patch: Partial<PlanVariable>) => {
    if (!plan || locked) return;
    const current = plan.variables[key];
    if (!current) return;
    const value = patch.value ?? current.value;
    const status: PlanVariableStatus =
      patch.status ??
      (value === current.recommended ? "recommended" : value !== current.recommended ? "custom" : current.status);
    setPlan({
      ...plan,
      variables: {
        ...plan.variables,
        [key]: { ...current, ...patch, value, status },
      },
    });
  };

  const updateDecision = (id: string, choice: string) => {
    if (!plan || locked) return;
    const decision = plan.decisions[id];
    if (!decision) return;
    setPlan({
      ...plan,
      decisions: {
        ...plan.decisions,
        [id]: { ...decision, choice },
      },
    });
  };

  const updateDecisionNotes = (id: string, notes: string) => {
    if (!plan || locked) return;
    const decision = plan.decisions[id];
    if (!decision) return;
    setPlan({
      ...plan,
      decisions: { ...plan.decisions, [id]: { ...decision, notes } },
    });
  };

  const updateSectionApproval = (sectionId: string, status: SectionApprovalStatus) => {
    if (!plan || locked) return;
    setPlan({
      ...plan,
      sectionApprovals: { ...plan.sectionApprovals, [sectionId]: status },
    });
  };

  const updateChecklist = (id: string, checked: boolean) => {
    if (!plan || locked) return;
    const item = plan.checklist[id];
    if (!item) return;
    setPlan({
      ...plan,
      checklist: {
        ...plan.checklist,
        [id]: {
          ...item,
          checked,
          checkedAt: checked ? new Date().toISOString() : null,
        },
      },
    });
  };

  if (!canView) {
    return (
      <AdminLayoutShell
        title="Content planning"
        subtitle="AALD + PerformX Nexus + Summit 2026"
      >
        <p className="text-sm text-[var(--ploy-text-secondary)]">
          You do not have permission to open the planning workspace.
        </p>
      </AdminLayoutShell>
    );
  }

  if (!isApprover) {
    return (
      <AdminLayoutShell
        title="Content planning"
        subtitle="AALD + PerformX Nexus + Summit 2026"
      >
        <div className="ploy-surface-elevated space-y-3 p-6 text-sm text-[var(--ploy-text-secondary)]">
          <p>
            This workspace is for approvers (Super Admin, Executive Assistant, or Admin Manager).
          </p>
          <p className="text-[var(--ploy-text-tertiary)]">
            Your role can see the Planning link but cannot edit decisions or sign off. Ask an approver to review{" "}
            <code className="text-xs">docs/content-strategy/aald-performx-planning.md</code> or complete the review in this workspace.
          </p>
        </div>
      </AdminLayoutShell>
    );
  }

  return (
    <AdminLayoutShell
      title="Content planning"
      subtitle="AALD + PerformX Nexus + Summit 2026 — review before CMS copy goes live"
    >
      {!isSupabaseConfigured && (
        <AdminSetupNotice message="Demo mode — plan changes are not persisted to Supabase." />
      )}

      {loading && (
        <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading plan…</p>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {notice && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {notice}
        </div>
      )}

      {plan && readiness && (
        <>
          <div className="ploy-surface-elevated mb-6 space-y-4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="ploy-kicker">Planning status</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide",
                      statusPillClass(plan.status),
                    )}
                  >
                    {STATUS_LABELS[plan.status]}
                  </span>
                  {locked && (
                    <span className="inline-flex items-center gap-1 text-sm text-[var(--ploy-text-tertiary)]">
                      <Lock className="size-4" />
                      Locked after approval
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!plan || saving}
                  onClick={() => {
                    if (!plan) return;
                    downloadMarkdown(
                      "aald-performx-planning.md",
                      exportPlanToMarkdown(plan),
                    );
                  }}
                >
                  <Download className="size-4" />
                  Export markdown
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={locked || saving}
                  onClick={() => void persist(plan)}
                >
                  <Save className="size-4" />
                  Save draft
                </Button>
                <Button
                  size="sm"
                  disabled={locked || saving || !readiness.ready}
                  onClick={() => void persist(plan, true)}
                >
                  <CheckCircle2 className="size-4" />
                  Mark plan approved
                </Button>
              </div>
            </div>

            <div
              className={cn(
                "rounded-lg border px-4 py-3 text-sm",
                readiness.ready
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-amber-200 bg-amber-50 text-amber-950",
              )}
            >
              {readiness.ready ? (
                <p>
                  <strong>Ready for implementation.</strong> All decisions recorded, checklist complete, and no variables on hold. Approver can mark the plan approved.
                </p>
              ) : (
                <p>
                  <strong>Not ready yet.</strong>{" "}
                  {readiness.pendingDecisions > 0 &&
                    `${readiness.pendingDecisions} decision(s) pending. `}
                  {readiness.openChecklist > 0 &&
                    `${readiness.openChecklist} checklist item(s) open. `}
                  {readiness.holdVariables > 0 &&
                    `${readiness.holdVariables} variable(s) on hold. `}
                  {readiness.pendingSections > 0 &&
                    `${readiness.pendingSections} page section(s) not approved.`}
                </p>
              )}
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2 border-b border-[var(--ploy-border-subtle)] pb-4">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  tab === id
                    ? "bg-[var(--ploy-background-accent)] text-white"
                    : "text-[var(--ploy-text-secondary)] hover:bg-[var(--ploy-background-secondary)]",
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="space-y-6">
              <section className="ploy-surface-elevated p-6">
                <h2 className="text-lg font-semibold">Route map</h2>
                <ul className="mt-4 space-y-2 text-sm text-[var(--ploy-text-secondary)]">
                  <li>
                    <strong>/work/aald</strong> — Evergreen AALD corporate page
                  </li>
                  <li>
                    <strong>/work/performx</strong> — PerformX Nexus ecosystem
                  </li>
                  <li>
                    <strong>/events/performx-summit-2026</strong> — Summit edition page
                  </li>
                </ul>
                <p className="mt-4 text-sm text-[var(--ploy-text-tertiary)]">
                  Canonical markdown reference:{" "}
                  <code className="text-xs">docs/content-strategy/aald-performx-planning.md</code>
                </p>
              </section>
              <section className="ploy-surface-elevated p-6">
                <h2 className="text-lg font-semibold">Progress</h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-[var(--ploy-text-tertiary)]">
                      Decisions
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold">
                      {Object.values(plan.decisions).length - readiness.pendingDecisions}
                      <span className="text-base font-normal text-[var(--ploy-text-tertiary)]">
                        /{Object.values(plan.decisions).length}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-[var(--ploy-text-tertiary)]">
                      Checklist
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold">
                      {Object.values(plan.checklist).filter((c) => c.checked).length}
                      <span className="text-base font-normal text-[var(--ploy-text-tertiary)]">
                        /{Object.values(plan.checklist).length}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-[var(--ploy-text-tertiary)]">
                      Variables on hold
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold">{readiness.holdVariables}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-[var(--ploy-text-tertiary)]">
                      Sections approved
                    </dt>
                    <dd className="mt-1 text-2xl font-semibold">
                      {plan.pages.flatMap((p) => p.sections).length - readiness.pendingSections}
                      <span className="text-base font-normal text-[var(--ploy-text-tertiary)]">
                        /{plan.pages.flatMap((p) => p.sections).length}
                      </span>
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          )}

          {tab === "variables" && (
            <div className="space-y-4">
              {Object.values(plan.variables).map((variable) => (
                <div key={variable.key} className="ploy-surface-elevated space-y-4 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{variable.label}</p>
                      <p className="mt-1 text-xs text-[var(--ploy-text-tertiary)]">
                        Source: {variable.source}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        variable.status === "hold"
                          ? "bg-red-100 text-red-800"
                          : variable.status === "custom"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-emerald-100 text-emerald-800",
                      )}
                    >
                      {variable.status}
                    </span>
                  </div>
                  {variable.alternate && (
                    <p className="text-sm text-amber-800">
                      Conflict: {variable.alternate}
                    </p>
                  )}
                  <p className="text-sm text-[var(--ploy-text-tertiary)]">
                    Recommended: {variable.recommended}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                    <div>
                      <Label htmlFor={`var-${variable.key}`}>Current value</Label>
                      <Input
                        id={`var-${variable.key}`}
                        value={variable.value}
                        disabled={locked}
                        onChange={(e) => updateVariable(variable.key, { value: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex flex-col gap-2 sm:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={locked}
                        onClick={() =>
                          updateVariable(variable.key, {
                            value: variable.recommended,
                            status: "recommended",
                          })
                        }
                      >
                        Use recommended
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={locked}
                        onClick={() => updateVariable(variable.key, { status: "hold" })}
                      >
                        Mark hold
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "decisions" && (
            <div className="space-y-6">
              {Object.values(plan.decisions).map((decision) => (
                <div key={decision.id} className="ploy-surface-elevated space-y-4 p-6">
                  <div>
                    <h3 className="font-semibold">{decision.title}</h3>
                    <p className="mt-2 text-sm text-[var(--ploy-text-secondary)]">
                      {decision.context}
                    </p>
                  </div>
                  <fieldset disabled={locked} className="space-y-2">
                    <legend className="sr-only">{decision.title}</legend>
                    {decision.options.map((option) => (
                      <label
                        key={option.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--ploy-border-subtle)] p-3 has-[:checked]:border-[var(--ploy-background-accent)]"
                      >
                        <input
                          type="radio"
                          name={decision.id}
                          value={option.id}
                          checked={decision.choice === option.id}
                          onChange={() => updateDecision(decision.id, option.id)}
                          className="mt-1"
                        />
                        <span className="text-sm">
                          {option.label}
                          {option.recommended && (
                            <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                              Recommended
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <div>
                    <Label htmlFor={`notes-${decision.id}`}>Notes (optional)</Label>
                    <textarea
                      id={`notes-${decision.id}`}
                      value={decision.notes}
                      disabled={locked}
                      onChange={(e) => updateDecisionNotes(decision.id, e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded-lg border border-[var(--ploy-border-default)] bg-transparent px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "pages" && (
            <div className="space-y-8">
              {plan.pages.map((page) => (
                <section key={page.id} className="ploy-surface-elevated p-6">
                  <h2 className="text-lg font-semibold">{page.title}</h2>
                  <p className="mt-1 text-sm text-[var(--ploy-text-tertiary)]">{page.route}</p>

                  <div className="mt-6 rounded-lg bg-[var(--ploy-background-secondary)] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--ploy-text-tertiary)]">
                      Hero
                    </p>
                    <p className="mt-2 text-sm">{page.hero.kicker}</p>
                    <p className="mt-1 text-lg font-semibold">
                      {page.hero.headline}{" "}
                      {page.hero.headlineSecondary && (
                        <span className="font-normal text-[var(--ploy-text-secondary)]">
                          {page.hero.headlineSecondary}
                        </span>
                      )}
                    </p>
                    <p className="mt-2 text-sm text-[var(--ploy-text-secondary)]">
                      {page.hero.description}
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    {page.sections.map((section) => {
                      const approval =
                        plan.sectionApprovals[section.id] ?? section.status;
                      return (
                        <div
                          key={section.id}
                          className="rounded-lg border border-[var(--ploy-border-subtle)] p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <h3 className="font-medium">{section.title}</h3>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                approval === "approved"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : approval === "revise"
                                    ? "bg-amber-100 text-amber-900"
                                    : "bg-[var(--ploy-background-secondary)]",
                              )}
                            >
                              {approval}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-[var(--ploy-text-secondary)]">
                            {section.body}
                          </p>
                          {section.bullets?.length ? (
                            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--ploy-text-secondary)]">
                              {section.bullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                              ))}
                            </ul>
                          ) : null}
                          {!locked && (
                            <div className="mt-4 flex gap-2">
                              <Button
                                size="sm"
                                variant={approval === "approved" ? "default" : "outline"}
                                onClick={() => updateSectionApproval(section.id, "approved")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant={approval === "revise" ? "default" : "outline"}
                                onClick={() => updateSectionApproval(section.id, "revise")}
                              >
                                Revise
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}

          {tab === "approvals" && (
            <div className="space-y-6">
              <section className="ploy-surface-elevated space-y-4 p-6">
                <h2 className="text-lg font-semibold">Implementation checklist</h2>
                <div className="space-y-3">
                  {Object.values(plan.checklist).map((item) => (
                    <Checkbox
                      key={item.id}
                      label={item.label}
                      checked={item.checked}
                      disabled={locked}
                      onChange={(e) => updateChecklist(item.id, e.target.checked)}
                    />
                  ))}
                </div>
              </section>

              <section className="ploy-surface-elevated space-y-4 p-6">
                <h2 className="text-lg font-semibold">Approval note</h2>
                <p className="text-sm text-[var(--ploy-text-tertiary)]">
                  If approving with exceptions, record them here so implementation can proceed.
                </p>
                <textarea
                  value={plan.approvalNote}
                  disabled={locked}
                  onChange={(e) => setPlan({ ...plan, approvalNote: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-[var(--ploy-border-default)] bg-transparent px-3 py-2 text-sm"
                  placeholder="Optional exceptions or sign-off notes…"
                />
              </section>
            </div>
          )}
        </>
      )}
    </AdminLayoutShell>
  );
}
