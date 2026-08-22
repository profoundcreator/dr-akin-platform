"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { AudienceDashboard } from "@/components/admin/audience-dashboard";

export function AdminAudiencePage() {
  return (
    <AdminAuthShell>
      <AudienceDashboard />
    </AdminAuthShell>
  );
}
