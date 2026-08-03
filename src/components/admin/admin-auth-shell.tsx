"use client";

import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { AdminErrorBoundary } from "@/components/admin/admin-error-boundary";
import { AdminAuthProvider, useAdminAuth } from "@/context/admin-auth-provider";

function AdminAuthRedirect({
  message,
  showLoginLink = false,
}: {
  message: string;
  showLoginLink?: boolean;
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ background: "#f5f3ef", color: "#1a1a1a" }}
    >
      <Loader2
        className="size-8 animate-spin"
        style={{ color: "#6b6560" }}
        aria-hidden="true"
      />
      <p className="max-w-sm text-sm" style={{ color: "#3d3a36" }}>
        {message}
      </p>
      {showLoginLink && (
        <a
          href="/admin/login"
          className="rounded-md bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white no-underline"
        >
          Continue to admin sign in
        </a>
      )}
    </div>
  );
}

function AdminAuthGate({ children }: { children: ReactNode }) {
  const { profile, session, loading, configured, authError } = useAdminAuth();
  const isAuthenticated = Boolean(session && profile);

  useEffect(() => {
    if (loading) return;

    if (!configured) {
      window.location.replace("/admin/login");
      return;
    }

    if (!isAuthenticated) {
      const destination =
        session && !profile ? "/admin/login?error=profile" : "/admin/login";
      window.location.replace(destination);
    }
  }, [loading, configured, isAuthenticated, session, profile]);

  useEffect(() => {
    if (loading || isAuthenticated || !configured) return;

    const timer = window.setTimeout(() => {
      window.location.replace(
        session && !profile ? "/admin/login?error=profile" : "/admin/login",
      );
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [loading, isAuthenticated, configured, session, profile]);

  if (!configured) {
    return (
      <AdminAuthRedirect
        message="Admin sign-in is required. Redirecting…"
        showLoginLink
      />
    );
  }

  if (authError && !isAuthenticated) {
    return (
      <AdminAuthRedirect
        message={`${authError} Redirecting to sign in…`}
        showLoginLink
      />
    );
  }

  if (loading || !isAuthenticated) {
    return (
      <AdminAuthRedirect
        message={
          session && !profile
            ? "Loading your admin profile…"
            : "Verifying admin access…"
        }
        showLoginLink
      />
    );
  }

  return <>{children}</>;
}

export function AdminAuthShell({ children }: { children: ReactNode }) {
  return (
    <AdminErrorBoundary>
      <AdminAuthProvider>
        <AdminAuthGate>{children}</AdminAuthGate>
      </AdminAuthProvider>
    </AdminErrorBoundary>
  );
}
