"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { EventsDashboard } from "@/components/admin/events-dashboard";

export function AdminEventsPage() {
  return (
    <AdminAuthShell>
      <EventsDashboard />
    </AdminAuthShell>
  );
}
