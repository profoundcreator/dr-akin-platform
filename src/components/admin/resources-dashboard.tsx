"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { FileUp, PackageOpen } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { useAdminAuth } from "@/context/admin-auth-provider";
import { canManageResources, canUploadResources } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  listOrganizerResourceFiles,
  retireOrganizerResource,
} from "@/lib/organizer-resources/api";
import type { OrganizerResourceFile } from "@/lib/organizer-resources/types";
import { uploadOrganizerResource } from "@/lib/organizer-resources/upload";

function formatBytes(value: number): string {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResourcesDashboard() {
  const { profile } = useAdminAuth();
  const allowed = canManageResources(profile);
  const canUpload = canUploadResources(profile);
  const [resources, setResources] = useState<OrganizerResourceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!allowed || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResources(await listOrganizerResourceFiles());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load organizer resources.");
    } finally {
      setLoading(false);
    }
  }, [allowed]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canUpload) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const file = fields.get("file");
    if (!(file instanceof File) || !file.name) {
      setError("Choose a file to upload.");
      return;
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const resource = await uploadOrganizerResource({
        file,
        title: String(fields.get("title") ?? ""),
        category: String(fields.get("category") ?? ""),
        audienceVariant: String(fields.get("audienceVariant") ?? "professional") as
          | "professional"
          | "christian"
          | "universal",
        logicalKey: String(fields.get("logicalKey") ?? ""),
      });
      setNotice(`${resource.title} version ${resource.version} is ready to grant.`);
      form.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRetire(resource: OrganizerResourceFile) {
    if (!canUpload || !window.confirm(`Retire ${resource.title} version ${resource.version}?`)) return;
    setBusy(true);
    setError(null);
    try {
      await retireOrganizerResource(resource.id);
      setNotice(`${resource.title} version ${resource.version} was retired.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not retire the resource.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminLayoutShell
      title="Organizer Resources"
      subtitle="Private, versioned materials granted to individual bookings"
    >
      {!allowed ? (
        <div className="ploy-surface-elevated p-6 text-sm text-[var(--ploy-status-error)]">
          Your role cannot manage organizer resources.
        </div>
      ) : !isSupabaseConfigured ? (
        <div className="ploy-surface-elevated p-6 text-sm text-[var(--ploy-status-warning)]">
          Supabase is not configured. Resource uploads and grants remain disabled.
        </div>
      ) : (
        <div className="space-y-8">
          {error && (
            <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-4 py-3 text-sm text-[var(--ploy-status-error)]">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.14_145/0.1)] px-4 py-3 text-sm text-[var(--ploy-status-success)]">
              {notice}
            </p>
          )}

          {canUpload && (
            <form onSubmit={handleUpload} className="ploy-surface-elevated space-y-5 p-6">
              <div>
                <Heading as="h2" size="card">Upload approved material</Heading>
                <p className="mt-1 text-sm text-[var(--ploy-text-tertiary)]">
                  Reuse the same resource key to create the next version. Files stay private.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Title</span>
                  <input name="title" required minLength={2} className="w-full rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] bg-white px-3 py-2" placeholder="Official biography" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Category</span>
                  <input name="category" required minLength={2} className="w-full rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] bg-white px-3 py-2" placeholder="Biography" />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Audience</span>
                  <select
                    name="audienceVariant"
                    required
                    className="w-full rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] bg-white px-3 py-2"
                  >
                    <option value="professional">Professional</option>
                    <option value="christian">Christian / church</option>
                    <option value="universal">Universal</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Resource key</span>
                  <input name="logicalKey" className="w-full rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] bg-white px-3 py-2" placeholder="official-biography" />
                </label>
              </div>
              <label className="block space-y-2 text-sm">
                <span className="font-medium">File (PDF, ZIP, DOCX, JPEG, PNG, or WebP; 25 MB maximum)</span>
                <input name="file" type="file" required accept=".pdf,.zip,.docx,.jpg,.jpeg,.png,.webp" className="block w-full text-sm" />
              </label>
              <Button type="submit" disabled={busy}>
                <FileUp className="size-4" />
                {busy ? "Uploading..." : "Upload private file"}
              </Button>
            </form>
          )}

          <section className="ploy-surface-elevated space-y-5 p-6">
            <div className="flex items-center gap-3">
              <PackageOpen className="size-5 text-[var(--ploy-text-accent)]" />
              <Heading as="h2" size="card">Material catalog</Heading>
            </div>
            {loading ? (
              <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading resources...</p>
            ) : resources.length === 0 ? (
              <p className="text-sm text-[var(--ploy-text-tertiary)]">No approved materials uploaded yet.</p>
            ) : (
              <ul className="divide-y divide-[var(--ploy-border-subtle)]">
                {resources.map((resource) => (
                  <li key={resource.id} className="flex flex-wrap items-center gap-3 py-4 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{resource.title} · v{resource.version}</p>
                      <p className="truncate text-[var(--ploy-text-tertiary)]">
                        {resource.category} · {resource.audienceVariant} · {resource.fileName} · {formatBytes(resource.sizeBytes)}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--ploy-background-secondary)] px-3 py-1 text-xs">
                      {resource.status}{resource.isCurrent ? " · current" : ""}
                    </span>
                    {canUpload && resource.status === "available" && (
                      <Button variant="ghost" size="sm" disabled={busy} onClick={() => handleRetire(resource)}>
                        Retire
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </AdminLayoutShell>
  );
}
