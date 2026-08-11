"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { InsightMediumEditor } from "@/components/admin/insight-medium-editor";

export function AdminInsightEditorPage() {
  return (
    <AdminAuthShell>
      <InsightMediumEditor />
    </AdminAuthShell>
  );
}
