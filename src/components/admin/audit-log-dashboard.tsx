"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, ScrollText, Search } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  downloadAuditLogCsv,
  fetchAuditLogEntries,
  type AuditLogEntry,
} from "@/lib/audit/audit-log";
import {
  formatAuditEventType,
  formatAuditSummary,
  formatAuditTarget,
} from "@/lib/audit/event-labels";
import { useAdminAuth } from "@/context/admin-auth-provider";
import {
  canAccessAuditLog,
  canExportAuditLog,
  formatAdminRole,
} from "@/lib/auth/permissions";
import type { AdminRole } from "@/lib/supabase/database.types";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AuditLogDashboard() {
  const { profile } = useAdminAuth();
  const canView = canAccessAuditLog(profile);
  const canExport = canExportAuditLog(profile);
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  useEffect(() => {
    if (!canView) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setEntries(await fetchAuditLogEntries());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit log");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [canView]);

  const eventTypes = useMemo(() => {
    const types = new Set(entries.map((entry) => entry.eventType));
    return Array.from(types).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (eventFilter !== "all" && entry.eventType !== eventFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        entry.eventType.toLowerCase().includes(q) ||
        (entry.actorName?.toLowerCase().includes(q) ?? false) ||
        (entry.actorEmail?.toLowerCase().includes(q) ?? false) ||
        (entry.targetType?.toLowerCase().includes(q) ?? false) ||
        formatAuditSummary(entry.summary).toLowerCase().includes(q)
      );
    });
  }, [entries, eventFilter, search]);

  if (!canView) {
    return (
      <AdminLayoutShell title="Audit Log" subtitle="Sign-in and administrative action history">
        <p className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-4 py-3 text-sm text-[var(--ploy-text-secondary)]">
          Your role does not include access to the audit log. Contact a Super Admin if you need
          oversight access.
        </p>
      </AdminLayoutShell>
    );
  }

  return (
    <AdminLayoutShell
      title="Audit Log"
      subtitle="Sign-in and administrative action history (append-only)"
    >
      {error && (
        <p className="mb-4 rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-4 py-3 text-sm text-[var(--ploy-status-error)]">
          {error}
        </p>
      )}

      {profile?.role === "read_only_auditor" && (
        <p className="mb-4 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-4 py-3 text-sm text-[var(--ploy-text-secondary)]">
          Read-only auditor access — you can review this log but cannot change records elsewhere in
          the workspace.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading audit log…</p>
      ) : (
        <div className="ploy-surface-elevated space-y-6 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--ploy-text-tertiary)]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search actor, action, or summary"
                  className="pl-9"
                />
              </div>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm"
              >
                <option value="all">All actions</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatAuditEventType(type)}
                  </option>
                ))}
              </select>
            </div>
            {canExport && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => downloadAuditLogCsv(filtered)}
                disabled={filtered.length === 0}
              >
                <Download className="size-4" />
                Export CSV
              </Button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-[var(--ploy-text-secondary)]">
              <ScrollText className="size-10 text-[var(--ploy-text-tertiary)]" />
              <p className="text-sm">No audit events match your filters yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--ploy-border-subtle)] text-[var(--ploy-text-tertiary)]">
                    <th className="px-3 py-2 font-medium">Time</th>
                    <th className="px-3 py-2 font-medium">Actor</th>
                    <th className="px-3 py-2 font-medium">Action</th>
                    <th className="px-3 py-2 font-medium">Target</th>
                    <th className="px-3 py-2 font-medium">Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-[var(--ploy-border-subtle)] align-top last:border-0"
                    >
                      <td className="px-3 py-3 whitespace-nowrap text-[var(--ploy-text-secondary)]">
                        {formatTimestamp(entry.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-[var(--ploy-text-primary)]">
                          {entry.actorName ?? "Unknown"}
                        </div>
                        <div className="text-xs text-[var(--ploy-text-tertiary)]">
                          {entry.actorEmail ?? "—"}
                          {entry.actorRole
                            ? ` · ${formatAdminRole(entry.actorRole as AdminRole)}`
                            : ""}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[var(--ploy-text-primary)]">
                        {formatAuditEventType(entry.eventType)}
                      </td>
                      <td className="px-3 py-3 text-[var(--ploy-text-secondary)]">
                        {formatAuditTarget(entry.targetType, entry.targetId)}
                      </td>
                      <td className="max-w-xs px-3 py-3 text-[var(--ploy-text-secondary)]">
                        {formatAuditSummary(entry.summary)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AdminLayoutShell>
  );
}
