"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/context/admin-auth-provider";

function AdminAuthGate({ children }: { children: ReactNode }) {
  const { profile, session, loading, configured } = useAdminAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!configured) {
      window.location.href = "/admin/login";
      return;
    }

    if (session && !profile) {
      window.location.href = "/admin/login?error=profile";
      return;
    }

    if (!session && !profile) {
      window.location.href = "/admin/login";
      return;
    }

    setChecked(true);
  }, [loading, configured, profile, session]);

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ploy-background-secondary)]">
        <Loader2 className="size-8 animate-spin text-[var(--ploy-text-tertiary)]" />
      </div>
    );
  }

  if (loading || !checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ploy-background-secondary)]">
        <Loader2 className="size-8 animate-spin text-[var(--ploy-text-tertiary)]" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return <>{children}</>;
}

export function AdminAuthShell({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminAuthGate>{children}</AdminAuthGate>
    </AdminAuthProvider>
  );
}
