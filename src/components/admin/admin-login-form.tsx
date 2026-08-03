"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { AdminInviteSetupForm } from "@/components/admin/admin-invite-setup-form";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/context/admin-auth-provider";
import {
  establishSessionFromAuthHash,
  parseAuthHashType,
  type InviteCallbackType,
} from "@/lib/auth/invite-callback";
import { consumeAdminLoginError } from "@/lib/auth/login-redirect";
import { setInviteSetupActive } from "@/lib/auth/admin-session-bootstrap";
import { getSupabaseClient, tryGetSupabaseClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const {
    signIn,
    signOut,
    configured,
    session,
    profile,
    profileError,
    loading: authLoading,
  } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingInvite, setCheckingInvite] = useState(true);
  const [inviteFlow, setInviteFlow] = useState<{
    email: string;
    flowType: InviteCallbackType;
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stashed = consumeAdminLoginError();
    const queryError =
      params.get("error") === "profile"
        ? "You signed in, but the platform could not load your admin profile. Confirm your account exists in Supabase → admin_profiles with account_state = active."
        : null;

    setError(stashed ?? queryError);
  }, []);

  useEffect(() => {
    if (profileError && !error) {
      setError(profileError);
    }
  }, [profileError, error]);

  useEffect(() => {
    setInviteSetupActive(Boolean(inviteFlow));
    return () => setInviteSetupActive(false);
  }, [inviteFlow]);

  useEffect(() => {
    if (authLoading || !configured || inviteFlow || checkingInvite) return;
    if (session && profile && !profileError) {
      window.location.replace("/admin/requests");
    }
  }, [authLoading, configured, session, profile, profileError, inviteFlow, checkingInvite]);

  useEffect(() => {
    if (!configured) {
      setCheckingInvite(false);
      return;
    }

    const supabase = tryGetSupabaseClient();
    if (!supabase) {
      setCheckingInvite(false);
      return;
    }

    const hashType = parseAuthHashType();

    async function resolveInviteSession() {
      if (!hashType) {
        setCheckingInvite(false);
        return;
      }

      const result = await establishSessionFromAuthHash(supabase);
      if (!result.ok) {
        setError(result.message);
        setCheckingInvite(false);
        return;
      }

      setInviteFlow({ email: result.email, flowType: result.flowType });
      setInviteSetupActive(true);
      setCheckingInvite(false);
    }

    if (parseAuthHashType()) {
      resolveInviteSession();
      return;
    }

    setCheckingInvite(false);
  }, [configured]);

  if (!configured) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-[var(--ploy-radius-xl)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-elevated)] p-8 text-center">
        <Lock className="mx-auto size-10 text-[var(--ploy-status-warning)]" />
        <Heading as="h1" size="card">
          Supabase not configured
        </Heading>
        <p className="text-sm text-[var(--ploy-text-secondary)]">
          Set <code className="text-xs">PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-xs">PUBLIC_SUPABASE_ANON_KEY</code> in your{" "}
          <code className="text-xs">.env</code> file to enable admin authentication.
        </p>
      </div>
    );
  }

  if (checkingInvite) {
    return (
      <div className="mx-auto flex max-w-md items-center justify-center gap-2 py-16 text-sm text-[var(--ploy-text-secondary)]">
        <Loader2 className="size-4 animate-spin" />
        Checking invite link…
      </div>
    );
  }

  if (inviteFlow) {
    return <AdminInviteSetupForm email={inviteFlow.email} flowType={inviteFlow.flowType} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      const supabase = getSupabaseClient();
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!data.session) {
        throw new Error("Sign in succeeded but the session was not saved. Please try again.");
      }
      window.location.replace("/admin/requests");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  async function clearStaleSession() {
    setError(null);
    setLoading(true);
    try {
      await signOut();
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not clear session.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <a href="/" aria-label="Return to public site">
          <BrandLogo variant="footer" />
        </a>
        <div className="space-y-2">
        <p className="ploy-kicker">Private Workspace</p>
        <Heading as="h1" size="section">
          Admin sign in
        </Heading>
        <p className="text-sm text-[var(--ploy-text-secondary)]">
          Approved administrators only. Public self-registration is disabled.
        </p>
        </div>
      </div>

      {(error || (session && !profile && profileError)) && (
        <div
          className="rounded-[var(--ploy-radius-xl)] border border-[oklch(0.55_0.2_25/0.25)] bg-[oklch(0.55_0.2_25/0.08)] px-4 py-3 text-sm text-[var(--ploy-status-error)]"
          role="alert"
        >
          {error ?? profileError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-[var(--ploy-radius-xl)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-elevated)] p-8 shadow-[var(--ploy-shadow-sm)]"
      >
        <div className="space-y-2">
          <Label htmlFor="admin-email" required>
            Email address
          </Label>
          <Input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@organization.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password" required>
            Password
          </Label>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>

        {session && !profile && (
          <Button type="button" variant="secondary" className="w-full" disabled={loading} onClick={clearStaleSession}>
            Clear session and try again
          </Button>
        )}
      </form>
    </div>
  );
}
