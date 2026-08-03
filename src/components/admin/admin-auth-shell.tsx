"use client";

import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { AdminErrorBoundary } from "@/components/admin/admin-error-boundary";
import { AdminAuthProvider, useAdminAuth } from "@/context/admin-auth-provider";
import { redirectToAdminLogin } from "@/lib/auth/login-redirect";
import { Button } from "@/components/ui/button";

function AdminAuthRedirect({
  message,
  showLoginLink = false,
  showRetry = false,
  onRetry,
}: {
  message: string;
  showLoginLink?: boolean;
  showRetry?: boolean;
  onRetry?: () => void;
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
      <p className="max-w-md text-sm" style={{ color: "#3d3a36" }}>
        {message}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {showRetry && onRetry && (
          <Button type="button" variant="primary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
        {showLoginLink && (
          <a
            href="/admin/login"
            className="rounded-md bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-white no-underline"
          >
            Continue to admin sign in
          </a>
        )}
      </div>
    </div>
  );
}

function AdminAuthGate({ children }: { children: ReactNode }) {
  const { profile, session, loading, configured, authError, profileError, refresh, signOut } =
    useAdminAuth();
  const isAuthenticated = Boolean(session && profile);
  const awaitingProfile = Boolean(session && !profile && loading);

  useEffect(() => {
    if (loading || awaitingProfile || isAuthenticated) return;

    if (!configured) {
      redirectToAdminLogin("Admin sign-in is required.");
      return;
    }

    if (!session) {
      redirectToAdminLogin(profileError ?? authError);
    }
  }, [loading, awaitingProfile, configured, isAuthenticated, session, profileError, authError]);

  useEffect(() => {
    if (loading || awaitingProfile || isAuthenticated || !session || !profileError) return;

    const timer = window.setTimeout(() => {
      const reason = profileError;
      void signOut().finally(() => {
        redirectToAdminLogin(reason);
      });
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [loading, awaitingProfile, isAuthenticated, session, profileError, signOut]);

  if (!configured) {
    return (
      <AdminAuthRedirect
        message="Admin sign-in is required. Redirecting…"
        showLoginLink
      />
    );
  }

  if (authError && !session) {
    return (
      <AdminAuthRedirect
        message={`${authError} Redirecting to sign in…`}
        showLoginLink
      />
    );
  }

  if (awaitingProfile || (loading && !profileError)) {
    return (
      <AdminAuthRedirect
        message="Verifying admin access…"
        showLoginLink
      />
    );
  }

  if (session && !profile && profileError) {
    return (
      <AdminAuthRedirect
        message={`${profileError} Returning to sign in…`}
        showLoginLink
        showRetry
        onRetry={() => void refresh()}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminAuthRedirect
        message="Admin sign-in is required. Redirecting…"
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
