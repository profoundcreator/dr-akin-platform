"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { WorkOrgsDashboard } from "@/components/admin/work-orgs-dashboard";

export function AdminWorkOrgsPage() {
  return (
    <AdminAuthShell>
      <WorkOrgsDashboard />
    </AdminAuthShell>
  );
}
