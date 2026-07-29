"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Search } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEnquiries, updateEnquiryStatus, type EnquiryRecord } from "@/lib/booking/api";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = ["all", "New", "Open", "Awaiting Reply", "Resolved"] as const;

export function InboxDashboard() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setEnquiries(await getEnquiries());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load inbox");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return enquiries.filter((e) => {
      if (filter !== "all" && e.status !== filter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        e.contactName.toLowerCase().includes(q) ||
        e.contactEmail.toLowerCase().includes(q) ||
        (e.subject?.toLowerCase().includes(q) ?? false) ||
        e.source.toLowerCase().includes(q)
      );
    });
  }, [enquiries, filter, search]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateEnquiryStatus(id, status);
      setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  };

  return (
    <AdminLayoutShell title="Unified Inbox" subtitle="Enquiries from all channels">
      {error && (
        <p className="mb-4 rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-4 py-3 text-sm text-[var(--ploy-status-error)]">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading inbox...</p>
      ) : (
        <div className="ploy-surface-elevated space-y-6 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--ploy-text-tertiary)]" />
              <Input
                className="pl-9"
                placeholder="Search inbox..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    filter === f
                      ? "bg-[var(--ploy-interactive-primary)] text-[var(--ploy-text-inverse)]"
                      : "bg-[var(--ploy-interactive-secondary)] text-[var(--ploy-text-secondary)]",
                  )}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--ploy-text-tertiary)]">
                No enquiries match your filters.
              </p>
            ) : (
              filtered.map((enquiry) => (
                <div
                  key={enquiry.id}
                  className="rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-[var(--ploy-text-tertiary)]" />
                        <span className="rounded-full bg-[var(--ploy-background-accent-muted)] px-2 py-0.5 text-xs font-medium text-[var(--ploy-text-accent)]">
                          {enquiry.source}
                        </span>
                        <span className="text-xs text-[var(--ploy-text-tertiary)]">
                          {enquiry.priority}
                        </span>
                      </div>
                      <p className="font-medium">{enquiry.subject ?? "General enquiry"}</p>
                      <p className="text-sm text-[var(--ploy-text-secondary)]">
                        {enquiry.contactName} · {enquiry.contactEmail}
                        {enquiry.organization && ` · ${enquiry.organization}`}
                      </p>
                      {enquiry.message && (
                        <p className="mt-2 text-sm text-[var(--ploy-text-secondary)] line-clamp-2">
                          {enquiry.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-[var(--ploy-text-tertiary)]">
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </span>
                      <select
                        value={enquiry.status}
                        onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                        className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] bg-[var(--ploy-background-primary)] px-2 py-1 text-xs"
                      >
                        {["New", "Open", "Awaiting Reply", "Resolved", "Spam", "Archived"].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ),
                        )}
                      </select>
                      {enquiry.bookingRequestId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          href={`/admin/requests/detail?id=${enquiry.bookingRequestId}`}
                        >
                          View booking
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </AdminLayoutShell>
  );
}
