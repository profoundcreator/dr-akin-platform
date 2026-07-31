"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { InsightsDashboard } from "@/components/admin/insights-dashboard";

export function AdminInsightsPage() {
  return (
    <AdminAuthShell>
      <InsightsDashboard />
    </AdminAuthShell>
  );
}
