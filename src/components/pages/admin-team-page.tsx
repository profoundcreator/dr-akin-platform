"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { TeamDashboard } from "@/components/admin/team-dashboard";

export function AdminTeamPage() {
  return (
    <AdminAuthShell>
      <TeamDashboard />
    </AdminAuthShell>
  );
}
