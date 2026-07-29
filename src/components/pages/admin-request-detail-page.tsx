"use client";

import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { RequestDetailPage } from "@/components/admin/request-detail-page";
import { useEffect, useState } from "react";

export function AdminRequestDetailPage() {
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRequestId(params.get("id"));
  }, []);

  if (!requestId) {
    return (
      <AdminAuthShell>
        <p className="p-8 text-sm text-[var(--ploy-text-tertiary)]">Loading request...</p>
      </AdminAuthShell>
    );
  }

  return (
    <AdminAuthShell>
      <RequestDetailPage requestId={requestId} />
    </AdminAuthShell>
  );
}
