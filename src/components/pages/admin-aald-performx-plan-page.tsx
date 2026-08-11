"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { AaldPerformxPlanDashboard } from "@/components/admin/aald-performx-plan-dashboard";

export function AdminAaldPerformxPlanPage() {
  return (
    <AdminAuthShell>
      <AaldPerformxPlanDashboard />
    </AdminAuthShell>
  );
}
