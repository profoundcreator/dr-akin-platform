"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "@/context/admin-auth-provider";

function AdminAuthRedirect({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--ploy-background-secondary)] px-6 text-center">
      <Loader2 className="size-8 animate-spin text-[var(--ploy-text-tertiary)]" aria-hidden="true" />
      <p className="text-sm text-[var(--ploy-text-secondary)]">{message}</p>
    </div>
  );
}

function AdminAuthGate({ children }: { children: ReactNode }) {
  const { profile, session, loading, configured } = useAdminAuth();
  const [redirectMessage, setRedirectMessage] = useState<string | null>(null);

  const isAuthenticated = Boolean(session && profile);

  useEffect(() => {
    if (loading) return;

    if (!configured) {
      setRedirectMessage("Admin access requires Supabase. Redirecting to sign in…");
      window.location.replace("/admin/login");
      return;
    }

    if (!isAuthenticated) {
      const destination =
        session && !profile ? "/admin/login?error=profile" : "/admin/login";
      setRedirectMessage(
        session && !profile
          ? "Your admin profile could not be loaded. Redirecting…"
          : "Redirecting to admin sign in…",
      );
      window.location.replace(destination);
    }
  }, [loading, configured, isAuthenticated, session, profile]);

  if (!configured) {
    return <AdminAuthRedirect message={redirectMessage ?? "Loading admin workspace…"} />;
  }

  if (loading || !isAuthenticated) {
    return (
      <AdminAuthRedirect
        message={redirectMessage ?? "Verifying admin access…"}
      />
    );
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
