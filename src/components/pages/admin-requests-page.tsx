"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { RequestsDashboard } from "@/components/admin/requests-dashboard";

export function AdminRequestsPage() {
  return (
    <AdminAuthShell>
      <RequestsDashboard />
    </AdminAuthShell>
  );
}
