"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { InboxDashboard } from "@/components/admin/inbox-dashboard";

export function AdminInboxPage() {
  return (
    <AdminAuthShell>
      <InboxDashboard />
    </AdminAuthShell>
  );
}
