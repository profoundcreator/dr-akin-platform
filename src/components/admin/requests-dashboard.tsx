"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Filter, Search } from "lucide-react";
import { AdminDemoModeBanner } from "@/components/admin/admin-demo-mode-banner";
import { EaReviewModal } from "@/components/admin/ea-review-modal";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_FILTER_STATUSES } from "@/lib/booking/constants";
import { getBookingRequests } from "@/lib/booking/api";
import type { BookingRequest } from "@/lib/booking/types";
import { cn } from "@/lib/utils";

type AdminFilter = (typeof ADMIN_FILTER_STATUSES)[number]["id"];

function matchesFilter(request: BookingRequest, filter: AdminFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "new":
      return request.internalStatus === "New / Unassigned";
    case "under-review":
      return request.status === "Under Review";
    case "confirmed":
      return request.status === "Confirmed";
    case "pending-info":
      return request.status === "Information Required";
    case "conflicts":
      return request.conflictDetected;
    default:
      return true;
  }
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Confirmed" || status === "Completed"
      ? "bg-[oklch(0.55_0.14_145/0.12)] text-[var(--ploy-status-success)]"
      : status === "Declined" || status === "Cancelled"
        ? "bg-[oklch(0.55_0.2_25/0.12)] text-[var(--ploy-status-error)]"
        : status === "Information Required"
          ? "bg-[oklch(0.72_0.14_75/0.15)] text-[var(--ploy-status-warning)]"
          : "bg-[var(--ploy-interactive-secondary)] text-[var(--ploy-text-primary)]";

  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", tone)}>
      {status}
    </span>
  );
}

export function RequestsDashboard() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AdminFilter>("all");
  const [search, setSearch] = useState("");
  const [reviewRequest, setReviewRequest] = useState<BookingRequest | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getBookingRequests();
        setRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load requests");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (!matchesFilter(r, filter)) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        r.reference.toLowerCase().includes(q) ||
        r.form.name.toLowerCase().includes(q) ||
        r.form.organization.toLowerCase().includes(q) ||
        r.form.eventTitle.toLowerCase().includes(q) ||
        r.form.country.toLowerCase().includes(q)
      );
    });
  }, [requests, filter, search]);

  const stats = useMemo(
    () => ({
      new: requests.filter((r) => r.internalStatus === "New / Unassigned").length,
      review: requests.filter((r) => r.status === "Under Review").length,
      confirmed: requests.filter((r) => r.status === "Confirmed").length,
      pending: requests.filter((r) => r.status === "Information Required").length,
    }),
    [requests],
  );

  return (
    <AdminLayoutShell title="Executive Assistant — Requests">
      <AdminDemoModeBanner itemLabel="requests" count={requests.length} />

      {error && (
        <p className="mb-4 rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-4 py-3 text-sm text-[var(--ploy-status-error)]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading requests...</p>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "New requests", value: stats.new, icon: Clock },
              { label: "Under review", value: stats.review, icon: Filter },
              { label: "Confirmed", value: stats.confirmed, icon: CheckCircle2 },
              { label: "Pending info", value: stats.pending, icon: AlertTriangle },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="ploy-surface-elevated p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--ploy-text-secondary)]">{label}</p>
                  <Icon className="size-4 text-[var(--ploy-text-tertiary)]" />
                </div>
                <p className="mt-2 text-2xl font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="ploy-surface-elevated space-y-6 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--ploy-text-tertiary)]" />
                <Input
                  className="pl-9"
                  placeholder="Search by reference, name, org, event..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {ADMIN_FILTER_STATUSES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      filter === f.id
                        ? "bg-[var(--ploy-interactive-primary)] text-[var(--ploy-text-inverse)]"
                        : "bg-[var(--ploy-interactive-secondary)] text-[var(--ploy-text-secondary)] hover:text-[var(--ploy-text-primary)]",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--ploy-border-default)] text-[var(--ploy-text-tertiary)]">
                    <th className="pb-3 pr-4 font-medium">Reference</th>
                    <th className="pb-3 pr-4 font-medium">Organizer</th>
                    <th className="pb-3 pr-4 font-medium">Event</th>
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Assigned EA</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[var(--ploy-text-tertiary)]">
                        No requests match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((request) => (
                      <tr
                        key={request.id}
                        className="border-b border-[var(--ploy-border-subtle)] last:border-0"
                      >
                        <td className="py-4 pr-4 font-mono text-xs font-semibold">
                          <a
                            href={`/admin/requests/detail?id=${request.id}`}
                            className="hover:text-[var(--ploy-text-accent)]"
                          >
                            {request.reference}
                          </a>
                          {request.conflictDetected && (
                            <AlertTriangle className="ml-1 inline size-3.5 text-[var(--ploy-status-warning)]" />
                          )}
                        </td>
                        <td className="py-4 pr-4">
                          <p className="font-medium">{request.form.name}</p>
                          <p className="text-xs text-[var(--ploy-text-tertiary)]">
                            {request.form.organization}
                          </p>
                        </td>
                        <td className="py-4 pr-4">
                          <p className="font-medium">{request.form.eventTitle}</p>
                          <p className="text-xs text-[var(--ploy-text-tertiary)]">
                            {request.form.engagementType} · {request.form.format}
                          </p>
                        </td>
                        <td className="py-4 pr-4 text-[var(--ploy-text-secondary)]">
                          {request.form.preferredDate || "—"}
                          <p className="text-xs text-[var(--ploy-text-tertiary)]">
                            {request.form.city}, {request.form.country}
                          </p>
                        </td>
                        <td className="py-4 pr-4">
                          <StatusPill status={request.status} />
                        </td>
                        <td className="py-4 pr-4 text-[var(--ploy-text-secondary)]">
                          {request.assignedEa ?? "Unassigned"}
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              href={`/admin/requests/detail?id=${request.id}`}
                            >
                              Open
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReviewRequest(request)}
                            >
                              Screen
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <EaReviewModal
        request={reviewRequest}
        open={reviewRequest !== null}
        onClose={() => setReviewRequest(null)}
      />
    </AdminLayoutShell>
  );
}
