import { tryGetSupabaseClient } from "@/lib/supabase/client";

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  actorName: string | null;
  actorEmail: string | null;
  eventType: string;
  targetType: string | null;
  targetId: string | null;
  summary: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface ListAuditEventsRow {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  actor_name: string | null;
  actor_email: string | null;
  event_type: string;
  target_type: string | null;
  target_id: string | null;
  summary: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function mapRow(row: ListAuditEventsRow): AuditLogEntry {
  return {
    id: row.id,
    actorId: row.actor_id,
    actorRole: row.actor_role,
    actorName: row.actor_name,
    actorEmail: row.actor_email,
    eventType: row.event_type,
    targetType: row.target_type,
    targetId: row.target_id,
    summary: row.summary,
    metadata: row.metadata,
    createdAt: row.created_at,
  };
}

export async function fetchAuditLogEntries(limit = 200): Promise<AuditLogEntry[]> {
  const supabase = tryGetSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("list_audit_events", {
    p_limit: limit,
    p_offset: 0,
  });

  if (error) {
    if (error.message.includes("Could not find the function")) {
      throw new Error(
        "Audit log is not set up yet. Run supabase/migrations/016_phase_e_security.sql in Supabase SQL Editor.",
      );
    }
    throw new Error(error.message);
  }

  return ((data as ListAuditEventsRow[] | null) ?? []).map(mapRow);
}

export function downloadAuditLogCsv(entries: AuditLogEntry[]): void {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const header = ["Time", "Actor", "Email", "Role", "Action", "Target type", "Target ID", "Summary"];

  const rows = entries.map((entry) => [
    entry.createdAt,
    entry.actorName ?? "System",
    entry.actorEmail ?? "",
    entry.actorRole ?? "",
    entry.eventType,
    entry.targetType ?? "",
    entry.targetId ?? "",
    entry.summary ? JSON.stringify(entry.summary) : "",
  ]);

  const csv = [header, ...rows].map((row) => row.map((cell) => escape(String(cell))).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
