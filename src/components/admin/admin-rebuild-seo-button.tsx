"use client";

import { RefreshCw } from "lucide-react";
import { AdminHelpTip } from "@/components/admin/admin-help-tip";
import { Button } from "@/components/ui/button";
import { ADMIN_REBUILD_SEO_COPY } from "@/lib/admin/plain-language-copy";

interface AdminRebuildSeoButtonProps {
  rebuilding: boolean;
  onClick: () => void;
}

export function AdminRebuildSeoButton({ rebuilding, onClick }: AdminRebuildSeoButtonProps) {
  return (
    <div className="inline-flex items-center gap-1">
      <Button type="button" variant="ghost" size="sm" onClick={onClick} disabled={rebuilding}>
        <RefreshCw className={`size-4 shrink-0 ${rebuilding ? "animate-spin" : ""}`} />
        {rebuilding ? ADMIN_REBUILD_SEO_COPY.rebuilding : ADMIN_REBUILD_SEO_COPY.label}
      </Button>
      <AdminHelpTip text={ADMIN_REBUILD_SEO_COPY.help} />
    </div>
  );
}
