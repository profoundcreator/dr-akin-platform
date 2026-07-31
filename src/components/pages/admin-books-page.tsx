"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { BooksDashboard } from "@/components/admin/books-dashboard";

export function AdminBooksPage() {
  return (
    <AdminAuthShell>
      <BooksDashboard />
    </AdminAuthShell>
  );
}
