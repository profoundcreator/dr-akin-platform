const EVENT_LABELS: Record<string, string> = {
  "admin.sign_in.success": "Admin signed in",
  "admin.sign_out": "Admin signed out",
  "booking.status_updated": "Booking status updated",
  "enquiry.status_updated": "Enquiry status updated",
  "event_submitted_for_approval": "Event submitted for approval",
  "event_published": "Event published",
  "book_submitted_for_approval": "Book submitted for approval",
  "book_published": "Book published",
  "insight_submitted_for_approval": "Article submitted for approval",
  "insight_published": "Article published",
  "work_org_submitted_for_approval": "Work platform submitted for approval",
  "work_org_published": "Work platform published",
  "team_member_invited": "Team member invited",
  "team_member_invite_resent": "Team invite resent",
};

export function formatAuditEventType(eventType: string): string {
  if (EVENT_LABELS[eventType]) return EVENT_LABELS[eventType];
  return eventType.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatAuditTarget(targetType: string | null, targetId: string | null): string {
  if (!targetType && !targetId) return "—";
  if (!targetId) return targetType ?? "—";
  return `${targetType ?? "record"} · ${targetId.slice(0, 8)}…`;
}

export function formatAuditSummary(summary: Record<string, unknown> | null): string {
  if (!summary || Object.keys(summary).length === 0) return "—";
  try {
    const text = JSON.stringify(summary);
    return text.length > 120 ? `${text.slice(0, 117)}…` : text;
  } catch {
    return "—";
  }
}
