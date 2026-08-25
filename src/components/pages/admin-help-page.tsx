"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { HelpCenterDashboard } from "@/components/admin/help-center-dashboard";

export function AdminHelpPage() {
  return (
    <AdminAuthShell>
      <HelpCenterDashboard />
    </AdminAuthShell>
  );
}
