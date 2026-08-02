"use client";

import { useEffect, useState } from "react";
import { AdminAuthShell } from "@/components/admin/admin-auth-shell";
import { InboxDetailPage } from "@/components/admin/inbox-detail-page";

export function AdminInboxDetailPage() {
  const [enquiryId, setEnquiryId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEnquiryId(params.get("id"));
  }, []);

  if (!enquiryId) {
    return (
      <AdminAuthShell>
        <p className="p-8 text-sm text-[var(--ploy-text-tertiary)]">Loading enquiry...</p>
      </AdminAuthShell>
    );
  }

  return (
    <AdminAuthShell>
      <InboxDetailPage enquiryId={enquiryId} />
    </AdminAuthShell>
  );
}
