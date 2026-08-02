"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { ResourcesDashboard } from "@/components/admin/resources-dashboard";

export function AdminResourcesPage() {
  return (
    <AdminAuthShell>
      <ResourcesDashboard />
    </AdminAuthShell>
  );
}
