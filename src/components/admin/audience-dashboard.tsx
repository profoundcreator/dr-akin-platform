"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Users } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/context/admin-auth-provider";
import { tryGetSupabaseClient } from "@/lib/supabase/client";

interface AudienceRow {
  id: string;
  email: string;
  name: string | null;
  consent_at: string;
  consent_source: string;
  esp_provider: string | null;
  esp_subscriber_id: string | null;
  status: string;
  created_at: string;
}

const SOURCE_LABELS: Record<string, string> = {
  contact: "Contact form",
  booking: "Booking form",
  newsletter: "Footer newsletter",
  summit_interest: "Summit interest",
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function downloadCsv(rows: AudienceRow[]): void {
  const header = ["email", "name", "consent_source", "status", "esp_provider", "consent_at"];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.email,
        row.name ?? "",
        row.consent_source,
        row.status,
        row.esp_provider ?? "",
        row.consent_at,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `audience-export-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AudienceDashboard() {
  const { profile } = useAdminAuth();
  const [rows, setRows] = useState<AudienceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = tryGetSupabaseClient();
      if (!supabase) {
        setLoading(false);
        setError("Supabase is not configured.");
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from("audience_members")
          .select(
            "id, email, name, consent_at, consent_source, esp_provider, esp_subscriber_id, status, created_at",
          )
          .order("consent_at", { ascending: false });

        if (queryError) throw new Error(queryError.message);
        setRows((data ?? []) as AudienceRow[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audience.");
      } finally {
        setLoading(false);
      }
    }

    if (profile) void load();
    else setLoading(false);
  }, [profile]);

  const activeCount = useMemo(
    () => rows.filter((row) => row.status === "active").length,
    [rows],
  );

  const sourceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of rows.filter((r) => r.status === "active")) {
      counts[row.consent_source] = (counts[row.consent_source] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const espSynced = useMemo(
    () => rows.filter((row) => row.status === "active" && row.esp_subscriber_id).length,
    [rows],
  );

  return (
    <AdminLayoutShell
      title="Audience"
      subtitle="Marketing opt-ins from contact, booking, newsletter, and summit interest forms."
    >
      <div className="space-y-8">
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] p-6">
            <p className="text-sm text-[var(--ploy-text-tertiary)]">Active subscribers</p>
            <p className="mt-2 text-3xl font-semibold">{loading ? "…" : activeCount}</p>
          </div>
          <div className="rounded-xl border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] p-6">
            <p className="text-sm text-[var(--ploy-text-tertiary)]">ESP synced</p>
            <p className="mt-2 text-3xl font-semibold">{loading ? "…" : espSynced}</p>
          </div>
          <div className="rounded-xl border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] p-6">
            <p className="text-sm text-[var(--ploy-text-tertiary)]">Total records</p>
            <p className="mt-2 text-3xl font-semibold">{loading ? "…" : rows.length}</p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-[var(--ploy-text-tertiary)]" />
              <h2 className="font-semibold">Source breakdown</h2>
            </div>
            <Button
              variant="secondary"
              size="sm"
              disabled={loading || rows.length === 0}
              onClick={() => downloadCsv(rows)}
            >
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>
          {sourceBreakdown.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--ploy-text-tertiary)]">
              {loading ? "Loading…" : "No audience members yet."}
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {sourceBreakdown.map(([source, count]) => (
                <li
                  key={source}
                  className="flex items-center justify-between border-b border-[var(--ploy-border-subtle)] py-2 text-sm last:border-0"
                >
                  <span>{SOURCE_LABELS[source] ?? source}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--ploy-border-primary)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">ESP</th>
                <th className="px-4 py-3 font-medium">Consented</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-[var(--ploy-text-tertiary)]">
                    Loading audience…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-[var(--ploy-text-tertiary)]">
                    No records yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--ploy-border-subtle)] last:border-0">
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.name ?? "—"}</td>
                    <td className="px-4 py-3">{SOURCE_LABELS[row.consent_source] ?? row.consent_source}</td>
                    <td className="px-4 py-3">{row.status}</td>
                    <td className="px-4 py-3">
                      {row.esp_provider
                        ? `${row.esp_provider}${row.esp_subscriber_id ? " ✓" : ""}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatTimestamp(row.consent_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
