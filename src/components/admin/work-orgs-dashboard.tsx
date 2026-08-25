"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Briefcase,
  Check,
  Download,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AdminSetupNotice } from "@/components/admin/admin-setup-notice";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminRebuildSeoButton } from "@/components/admin/admin-rebuild-seo-button";
import { Button } from "@/components/ui/button";
import { AdminOptionalImageField } from "@/components/admin/admin-optional-image-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/context/admin-auth-provider";
import {
  canApproveWorkOrgs,
  canPermanentlyDeleteWorkOrgs,
} from "@/lib/auth/permissions";
import { triggerSiteRebuild } from "@/lib/events/trigger-rebuild";
import { publishNoticeWithRebuild } from "@/lib/events/publish-notice";
import type { EventBrand, WorkOrgStatus } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  WORK_ORG_BRAND_OPTIONS,
  WORK_ORG_HERO_IMAGE_HINT,
  WORK_ORG_STATUS_LABELS,
} from "@/lib/work-orgs/constants";
import { uploadWorkOrgHero } from "@/lib/work-orgs/hero-upload";
import {
  createWorkOrg,
  deleteWorkOrgPermanently,
  getAdminWorkOrgs,
  getPendingWorkOrgs,
  getWorkOrgHeroUrl,
  isPhase4SchemaReady,
  isValidWorkOrgSlug,
  logWorkOrgAudit,
  slugifyWorkOrgTitle,
  updateWorkOrg,
  workOrgsToCsv,
} from "@/lib/work-orgs/orgs";
import type { PlatformWorkOrg, WorkOrgInput, WorkOrgSection } from "@/lib/work-orgs/types";

type SectionForm = {
  title: string;
  body: string;
  bullets: string;
};

const EMPTY_SECTION: SectionForm = { title: "", body: "", bullets: "" };

const EMPTY_FORM = {
  slug: "",
  brandKey: "aald" as EventBrand,
  pageTitle: "",
  pillarTitle: "",
  brandLabel: "",
  kicker: "",
  headline: "",
  headlineSecondary: "",
  description: "",
  hubCardDescription: "",
  sections: [{ ...EMPTY_SECTION }],
  ctaLabel: "",
  ctaHref: "",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
  externalUrl: "",
  sortOrder: 1,
};

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function sectionsToForm(sections: WorkOrgSection[]): SectionForm[] {
  if (sections.length === 0) return [{ ...EMPTY_SECTION }];
  return sections.map((section) => ({
    title: section.title,
    body: section.body,
    bullets: section.bullets?.join("\n") ?? "",
  }));
}

function formToSections(sections: SectionForm[]): WorkOrgSection[] {
  return sections
    .map((section) => ({
      title: section.title.trim(),
      body: section.body.trim(),
      bullets: section.bullets
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    }))
    .filter((section) => section.title && section.body)
    .map((section) => ({
      ...section,
      bullets: section.bullets.length > 0 ? section.bullets : undefined,
    }));
}

export function WorkOrgsDashboard() {
  const { profile } = useAdminAuth();
  const isApprover = canApproveWorkOrgs(profile);
  const canDelete = canPermanentlyDeleteWorkOrgs(profile);
  const [orgs, setOrgs] = useState<PlatformWorkOrg[]>([]);
  const [pending, setPending] = useState<PlatformWorkOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [existingHeroPath, setExistingHeroPath] = useState<string | null>(null);
  const [heroImageHidden, setHeroImageHidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [schemaReady, setSchemaReady] = useState(true);

  async function loadOrgs() {
    try {
      setError(null);
      setSchemaReady(await isPhase4SchemaReady());
      const [allOrgs, pendingOrgs] = await Promise.all([
        getAdminWorkOrgs(),
        isApprover ? getPendingWorkOrgs() : Promise.resolve([]),
      ]);
      setOrgs(allOrgs);
      setPending(pendingOrgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load work orgs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrgs();
  }, [isApprover]);

  const sortedOrgs = useMemo(
    () => [...orgs].sort((a, b) => a.sortOrder - b.sortOrder || a.pillarTitle.localeCompare(b.pillarTitle)),
    [orgs],
  );

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setHeroFile(null);
    setHeroPreview(null);
    setExistingHeroPath(null);
    setHeroImageHidden(false);
  }

  function startEdit(org: PlatformWorkOrg) {
    setEditingId(org.id);
    setForm({
      slug: org.slug,
      brandKey: org.brandKey,
      pageTitle: org.pageTitle,
      pillarTitle: org.pillarTitle,
      brandLabel: org.brandLabel,
      kicker: org.kicker,
      headline: org.headline,
      headlineSecondary: org.headlineSecondary ?? "",
      description: org.description,
      hubCardDescription: org.hubCardDescription,
      sections: sectionsToForm(org.sections),
      ctaLabel: org.ctaLabel ?? "",
      ctaHref: org.ctaHref ?? "",
      secondaryCtaLabel: org.secondaryCtaLabel ?? "",
      secondaryCtaHref: org.secondaryCtaHref ?? "",
      externalUrl: org.externalUrl ?? "",
      sortOrder: org.sortOrder,
    });
    setExistingHeroPath(org.heroImagePath);
    setHeroImageHidden(org.heroImageHidden);
    setHeroFile(null);
    setHeroPreview(getWorkOrgHeroUrl(org.heroImagePath));
  }

  async function buildInput(status?: WorkOrgStatus): Promise<WorkOrgInput> {
    const slug = form.slug.trim().toLowerCase() || slugifyWorkOrgTitle(form.pillarTitle || form.headline);

    if (!form.pillarTitle.trim()) throw new Error("Pillar title is required.");
    if (!form.brandLabel.trim()) throw new Error("Brand label is required.");
    if (!form.pageTitle.trim()) throw new Error("Page title is required.");
    if (!form.kicker.trim() || !form.headline.trim() || !form.description.trim()) {
      throw new Error("Kicker, headline, and description are required.");
    }
    if (!form.hubCardDescription.trim()) throw new Error("Hub card description is required.");
    if (!isValidWorkOrgSlug(slug)) {
      throw new Error("Link name must use lowercase letters, numbers, and hyphens only.");
    }

    const sections = formToSections(form.sections);
    if (sections.length === 0) throw new Error("Add at least one content section.");

    let heroImagePath = existingHeroPath;
    if (heroFile) {
      heroImagePath = await uploadWorkOrgHero(heroFile, slug);
    }

    return {
      slug,
      brandKey: form.brandKey,
      pageTitle: form.pageTitle,
      pillarTitle: form.pillarTitle,
      brandLabel: form.brandLabel,
      kicker: form.kicker,
      headline: form.headline,
      headlineSecondary: form.headlineSecondary,
      description: form.description,
      hubCardDescription: form.hubCardDescription,
      sections,
      ctaLabel: form.ctaLabel,
      ctaHref: form.ctaHref,
      secondaryCtaLabel: form.secondaryCtaLabel,
      secondaryCtaHref: form.secondaryCtaHref,
      externalUrl: form.externalUrl,
      heroImagePath,
      heroImageHidden,
      sortOrder: form.sortOrder,
      status,
    };
  }

  async function saveOrg(mode: "draft" | "submit" | "publish") {
    setError(null);
    setNotice(null);
    setSaving(true);

    try {
      const input = await buildInput(
        mode === "publish" ? "published" : mode === "submit" ? "pending_approval" : "draft",
      );

      let saved: PlatformWorkOrg;

      if (editingId) {
        saved = await updateWorkOrg(editingId, {
          ...input,
          ...(mode === "publish"
            ? {
                approvedBy: profile?.id ?? null,
                approvedAt: new Date().toISOString(),
                rejectionNote: null,
              }
            : {}),
          ...(mode === "submit"
            ? {
                submittedBy: profile?.id ?? null,
                rejectionNote: null,
              }
            : {}),
        });
      } else if (mode === "publish" && isApprover) {
        saved = await createWorkOrg(input, {
          createdBy: profile?.id,
          publishDirectly: true,
          approverId: profile?.id,
        });
      } else if (mode === "submit") {
        saved = await createWorkOrg(input, {
          createdBy: profile?.id,
          submitForApproval: true,
        });
      } else {
        saved = await createWorkOrg(input, { createdBy: profile?.id });
      }

      if (mode === "submit") {
        await logWorkOrgAudit("work_org_submitted_for_approval", saved.id, {
          title: saved.pillarTitle,
          slug: saved.slug,
          submittedBy: profile?.full_name,
        });
        setNotice("Platform submitted for approval.");
      }

      if (mode === "publish") {
        await logWorkOrgAudit("work_org_published", saved.id, {
          title: saved.pillarTitle,
          slug: saved.slug,
          publishedBy: profile?.full_name,
        });
        const rebuild = await triggerSiteRebuild();
        setNotice(publishNoticeWithRebuild("Platform published.", rebuild));
      }

      resetForm();
      await loadOrgs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save platform");
    } finally {
      setSaving(false);
    }
  }

  async function approveOrg(org: PlatformWorkOrg) {
    setSaving(true);
    setError(null);
    try {
      const saved = await updateWorkOrg(org.id, {
        status: "published",
        manuallyHidden: false,
        approvedBy: profile?.id ?? null,
        approvedAt: new Date().toISOString(),
        rejectionNote: null,
      });
      await logWorkOrgAudit("work_org_published", saved.id, {
        title: saved.pillarTitle,
        slug: saved.slug,
        publishedBy: profile?.full_name,
        approvedFromPending: true,
      });
      const rebuild = await triggerSiteRebuild();
      setNotice(publishNoticeWithRebuild("Platform approved.", rebuild));
      await loadOrgs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve platform");
    } finally {
      setSaving(false);
    }
  }

  async function rejectOrg(org: PlatformWorkOrg) {
    const note = window.prompt("Optional note for the person who submitted this platform:");
    setSaving(true);
    try {
      await updateWorkOrg(org.id, {
        status: "draft",
        rejectionNote: note?.trim() || "Please revise and resubmit.",
      });
      await loadOrgs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send back platform");
    } finally {
      setSaving(false);
    }
  }

  async function toggleHidden(org: PlatformWorkOrg) {
    try {
      await updateWorkOrg(org.id, { manuallyHidden: !org.manuallyHidden });
      await loadOrgs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update visibility");
    }
  }

  async function handleDelete(id: string) {
    if (!canDelete) return;
    if (!window.confirm("Delete this platform permanently? This cannot be undone.")) return;
    try {
      await deleteWorkOrgPermanently(id);
      if (editingId === id) resetForm();
      await loadOrgs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete platform");
    }
  }

  async function handleRebuild() {
    setRebuilding(true);
    setError(null);
    try {
      const result = await triggerSiteRebuild();
      setNotice(result.message);
      if (!result.ok) setError(result.message);
    } finally {
      setRebuilding(false);
    }
  }

  function handleHeroChange(file: File | null) {
    setHeroFile(file);
    if (file) setHeroImageHidden(false);
    setHeroPreview(file ? URL.createObjectURL(file) : getWorkOrgHeroUrl(existingHeroPath));
  }

  function handleRemoveHero() {
    setHeroFile(null);
    setExistingHeroPath(null);
    setHeroPreview(null);
    setHeroImageHidden(false);
  }

  if (!isSupabaseConfigured) {
    return (
      <AdminLayoutShell title="Work" subtitle="Manage ecosystem platforms">
        <p className="ploy-surface-elevated p-6 text-sm text-[var(--ploy-text-secondary)]">
          Connect Supabase to manage work platforms at{" "}
          <a href="/work" className="underline">/work</a>.
        </p>
      </AdminLayoutShell>
    );
  }

  return (
    <AdminLayoutShell title="Work" subtitle="Manage ecosystem platforms, approvals, and hero images">
      {!schemaReady && <AdminSetupNotice variant="work-orgs" />}
      {(error || notice) && (
        <div className="mb-4 space-y-2">
          {error && (
            <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-4 py-3 text-sm text-[var(--ploy-status-error)]">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.14_145/0.12)] px-4 py-3 text-sm text-[var(--ploy-status-success)]">
              {notice}
            </p>
          )}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            downloadCsv(`work-orgs-${new Date().toISOString().slice(0, 10)}.csv`, workOrgsToCsv(orgs))
          }
        >
          <Download className="size-4 shrink-0" />
          Export CSV
        </Button>
        {isApprover && (
          <AdminRebuildSeoButton rebuilding={rebuilding} onClick={handleRebuild} />
        )}
        <a href="/work" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4">
          View public page
          <ArrowUpRight className="size-4" />
        </a>
      </div>

      {isApprover && pending.length > 0 && (
        <div className="ploy-surface-elevated mb-8 space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Briefcase className="size-4 text-[var(--ploy-accent-primary)]" />
            <h2 className="text-lg font-semibold">Awaiting approval ({pending.length})</h2>
          </div>
          <ul className="space-y-3">
            {pending.map((org) => (
              <li key={org.id} className="flex flex-wrap items-start justify-between gap-4 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4">
                <div>
                  <p className="font-medium">{org.pillarTitle}</p>
                  <p className="text-xs text-[var(--ploy-text-tertiary)]">/work/{org.slug} · {org.brandLabel}</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="primary" onClick={() => approveOrg(org)} disabled={saving}>
                    <Check className="size-4" />
                    Approve & publish
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => startEdit(org)}>Review</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => rejectOrg(org)} disabled={saving}>
                    <X className="size-4" />
                    Send back
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form
          className="ploy-surface-elevated space-y-5 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            saveOrg(isApprover ? "publish" : "submit");
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Plus className="size-4 text-[var(--ploy-accent-primary)]" />
              <h2 className="text-lg font-semibold">{editingId ? "Edit platform" : "Add platform"}</h2>
            </div>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>Cancel edit</Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-pillar" required>Pillar title</Label>
              <Input id="org-pillar" value={form.pillarTitle} onChange={(e) => setForm((p) => ({ ...p, pillarTitle: e.target.value, pageTitle: p.pageTitle || `${e.target.value} — ${p.brandLabel || "Platform"}` }))} placeholder="Corporate Transformation" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-brand-label" required>Brand label</Label>
              <Input id="org-brand-label" value={form.brandLabel} onChange={(e) => setForm((p) => ({ ...p, brandLabel: e.target.value }))} placeholder="AALD" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-slug" required>Link name</Label>
              <Input id="org-slug" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase() }))} placeholder="aald" />
              <p className="text-xs text-[var(--ploy-text-tertiary)]">Public URL: /work/{form.slug || "your-link"}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-brand-key">Events brand key</Label>
              <select id="org-brand-key" value={form.brandKey} onChange={(e) => setForm((p) => ({ ...p, brandKey: e.target.value as EventBrand }))} className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm">
                {WORK_ORG_BRAND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-page-title" required>Page title (SEO)</Label>
            <Input id="org-page-title" value={form.pageTitle} onChange={(e) => setForm((p) => ({ ...p, pageTitle: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-kicker" required>Kicker</Label>
            <Input id="org-kicker" value={form.kicker} onChange={(e) => setForm((p) => ({ ...p, kicker: e.target.value }))} placeholder="AALD · Corporate Transformation" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-headline" required>Headline</Label>
            <Input id="org-headline" value={form.headline} onChange={(e) => setForm((p) => ({ ...p, headline: e.target.value, slug: p.slug || slugifyWorkOrgTitle(e.target.value) }))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-headline-secondary">Headline secondary line</Label>
            <Input id="org-headline-secondary" value={form.headlineSecondary} onChange={(e) => setForm((p) => ({ ...p, headlineSecondary: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-description" required>Description</Label>
            <textarea id="org-description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-hub-card" required>Hub & homepage card text</Label>
            <textarea id="org-hub-card" value={form.hubCardDescription} onChange={(e) => setForm((p) => ({ ...p, hubCardDescription: e.target.value }))} rows={2} className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label>Sections</Label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm((p) => ({ ...p, sections: [...p.sections, { ...EMPTY_SECTION }] }))}>Add section</Button>
            </div>
            {form.sections.map((section, index) => (
              <div key={index} className="space-y-3 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4">
                <Input value={section.title} onChange={(e) => setForm((p) => ({ ...p, sections: p.sections.map((item, i) => i === index ? { ...item, title: e.target.value } : item) }))} placeholder="Section title" />
                <textarea value={section.body} onChange={(e) => setForm((p) => ({ ...p, sections: p.sections.map((item, i) => i === index ? { ...item, body: e.target.value } : item) }))} rows={3} className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm" placeholder="Section body" />
                <textarea value={section.bullets} onChange={(e) => setForm((p) => ({ ...p, sections: p.sections.map((item, i) => i === index ? { ...item, bullets: e.target.value } : item) }))} rows={3} className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm" placeholder="Bullets (one per line, optional)" />
                {form.sections.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setForm((p) => ({ ...p, sections: p.sections.filter((_, i) => i !== index) }))}>
                    <X className="size-4" />
                    Remove section
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-cta-label">Primary CTA label</Label>
              <Input id="org-cta-label" value={form.ctaLabel} onChange={(e) => setForm((p) => ({ ...p, ctaLabel: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-cta-href">Primary CTA link</Label>
              <Input id="org-cta-href" value={form.ctaHref} onChange={(e) => setForm((p) => ({ ...p, ctaHref: e.target.value }))} placeholder="/book-dr-akin" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org-external">External website (optional)</Label>
            <Input id="org-external" value={form.externalUrl} onChange={(e) => setForm((p) => ({ ...p, externalUrl: e.target.value }))} placeholder="https://..." />
          </div>

          <AdminOptionalImageField
            id="org-hero"
            label="Hero image"
            hint={WORK_ORG_HERO_IMAGE_HINT}
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            previewUrl={heroPreview}
            uploadLabel="Upload hero"
            imageHidden={heroImageHidden}
            onFileSelect={handleHeroChange}
            onRemove={handleRemoveHero}
            onToggleHidden={heroPreview ? () => setHeroImageHidden((value) => !value) : undefined}
          />

          <div className="space-y-2">
            <Label htmlFor="org-sort">Sort order</Label>
            <Input id="org-sort" type="number" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" disabled={saving} onClick={() => saveOrg("draft")}>Save draft</Button>
            {isApprover ? (
              <Button type="submit" variant="primary" disabled={saving}>{saving ? "Saving…" : editingId ? "Publish changes" : "Publish platform"}</Button>
            ) : (
              <Button type="submit" variant="primary" disabled={saving}>{saving ? "Submitting…" : "Submit for approval"}</Button>
            )}
          </div>
        </form>

        <div className="ploy-surface-elevated space-y-6 p-6">
          <h2 className="text-lg font-semibold">All platforms</h2>
          {loading ? (
            <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading platforms…</p>
          ) : sortedOrgs.length === 0 ? (
            <p className="text-sm text-[var(--ploy-text-secondary)]">No platforms yet.</p>
          ) : (
            <ul className="space-y-4">
              {sortedOrgs.map((org) => (
                <li key={org.id} className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium">{org.pillarTitle}</p>
                      <p className="text-xs text-[var(--ploy-text-tertiary)]">
                        /work/{org.slug} · {WORK_ORG_STATUS_LABELS[org.status]}
                        {org.manuallyHidden ? " · Hidden" : ""}
                      </p>
                      <p className="text-sm text-[var(--ploy-text-secondary)]">{org.brandLabel}</p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(org)}>Edit</Button>
                      {isApprover && org.status === "published" && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => toggleHidden(org)}>
                          {org.manuallyHidden ? "Show" : "Hide"}
                        </Button>
                      )}
                      {canDelete && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(org.id)}>
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayoutShell>
  );
}
