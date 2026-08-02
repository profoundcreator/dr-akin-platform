"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { AuditLogDashboard } from "@/components/admin/audit-log-dashboard";

export function AdminAuditLogPage() {
  return (
    <AdminAuthShell>
      <AuditLogDashboard />
    </AdminAuthShell>
  );
}
