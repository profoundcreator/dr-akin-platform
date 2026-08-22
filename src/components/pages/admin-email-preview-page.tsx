"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { EmailPreviewDashboard } from "@/components/admin/email-preview-dashboard";

export function AdminEmailPreviewPage() {
  return (
    <AdminAuthShell>
      <EmailPreviewDashboard />
    </AdminAuthShell>
  );
}
