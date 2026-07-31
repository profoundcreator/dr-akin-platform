"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { HomepageDashboard } from "@/components/admin/homepage-dashboard";

export function AdminHomepagePage() {
  return (
    <AdminAuthShell>
      <HomepageDashboard />
    </AdminAuthShell>
  );
}
