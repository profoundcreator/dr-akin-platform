"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { useAdminAuth } from "@/context/admin-auth-provider";
import {
  canAssignResources,
  canManageResources,
  canOverrideResourceGrants,
} from "@/lib/auth/permissions";
import {
  grantBookingResource,
  listBookingResourceGrants,
  listOrganizerResourceFiles,
  revokeBookingResource,
} from "@/lib/organizer-resources/api";
import type {
  BookingResourceGrant,
  OrganizerResourceFile,
} from "@/lib/organizer-resources/types";

export function BookingResourceGrants({ bookingRequestId }: { bookingRequestId: string }) {
  const { profile } = useAdminAuth();
  const canView = canManageResources(profile);
  const canAssign = canAssignResources(profile);
  const canOverride = canOverrideResourceGrants(profile);
  const [resources, setResources] = useState<OrganizerResourceFile[]>([]);
  const [grants, setGrants] = useState<BookingResourceGrant[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canView) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [files, bookingGrants] = await Promise.all([
        listOrganizerResourceFiles(),
        listBookingResourceGrants(bookingRequestId),
      ]);
      setResources(files);
      setGrants(bookingGrants);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load resource grants.");
    } finally {
      setLoading(false);
    }
  }, [bookingRequestId, canView]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeGrants = grants.filter(
    (grant) => !grant.revokedAt && (!grant.expiresAt || new Date(grant.expiresAt) > new Date()),
  );
  const resourceById = useMemo(
    () => new Map(resources.map((resource) => [resource.id, resource])),
    [resources],
  );
  const available = resources.filter(
    (resource) =>
      resource.status === "available" &&
      resource.isCurrent &&
      !activeGrants.some((grant) => grant.resourceFileId === resource.id),
  );

  async function assign() {
    if (!selectedId || !canAssign) return;
    setBusy(true);
    setError(null);
    try {
      await grantBookingResource(
        bookingRequestId,
        selectedId,
        expiresAt ? new Date(expiresAt).toISOString() : undefined,
      );
      setSelectedId("");
      setExpiresAt("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not grant the resource.");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(grant: BookingResourceGrant) {
    const canReleaseOwn = profile?.role === "executive_assistant" && grant.grantedBy === profile.id;
    if ((!canOverride && !canReleaseOwn) || !window.confirm("Remove this material from the organizer tracker?")) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await revokeBookingResource(grant.id, "Released from booking request");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not revoke the resource.");
    } finally {
      setBusy(false);
    }
  }

  if (!canView) return null;

  return (
    <section className="ploy-surface-elevated space-y-5 p-6">
      <div>
        <Heading as="h2" size="card">Organizer materials</Heading>
        <p className="mt-1 text-sm text-[var(--ploy-text-tertiary)]">
          Only active grants appear on this booking&apos;s token-protected tracker.
        </p>
      </div>
      {error && (
        <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-4 py-3 text-sm text-[var(--ploy-status-error)]">
          {error}
        </p>
      )}
      {loading ? (
        <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading approved materials...</p>
      ) : activeGrants.length === 0 ? (
        <p className="text-sm text-[var(--ploy-text-tertiary)]">No materials granted to this booking.</p>
      ) : (
        <ul className="space-y-2">
          {activeGrants.map((grant) => {
            const resource = resourceById.get(grant.resourceFileId);
            const canRelease =
              canOverride ||
              (profile?.role === "executive_assistant" && grant.grantedBy === profile.id);
            return (
              <li key={grant.id} className="flex flex-wrap items-center gap-3 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-subtle)] px-4 py-3 text-sm">
                <FileCheck2 className="size-4 text-[var(--ploy-status-success)]" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {resource?.title ?? "Approved material"} · v{resource?.version ?? "—"}
                  </p>
                  <p className="text-xs text-[var(--ploy-text-tertiary)]">
                    {grant.expiresAt
                      ? `Expires ${new Date(grant.expiresAt).toLocaleString()}`
                      : "No automatic expiry"}
                  </p>
                </div>
                {canRelease && (
                  <Button variant="ghost" size="sm" disabled={busy} onClick={() => revoke(grant)}>
                    Revoke
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {canAssign && (
        <div className="grid gap-3 border-t border-[var(--ploy-border-subtle)] pt-5 md:grid-cols-[1fr_15rem_auto]">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Approved material</span>
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="w-full rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] bg-white px-3 py-2"
            >
              <option value="">Select a resource...</option>
              {available.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.title} · v{resource.version} · {resource.audienceVariant} · {resource.category}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Expiry (optional)</span>
            <input
              type="datetime-local"
              value={expiresAt}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(event) => setExpiresAt(event.target.value)}
              className="w-full rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] bg-white px-3 py-2"
            />
          </label>
          <Button className="self-end" disabled={busy || !selectedId} onClick={assign}>
            {busy ? "Saving..." : "Grant access"}
          </Button>
        </div>
      )}
    </section>
  );
}
