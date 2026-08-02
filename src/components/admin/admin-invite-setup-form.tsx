"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearAuthHashFromUrl } from "@/lib/auth/invite-callback";
import { getSupabaseClient } from "@/lib/supabase/client";

function formatSetupError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    const message = String((error as { message: unknown }).message);
    if (message) return message;
  }
  return "Could not finish account setup.";
}

function isMissingActivateRpcError(error: unknown): boolean {
  const message = formatSetupError(error).toLowerCase();
  return message.includes("activate_invited_admin") || message.includes("schema cache");
}

interface AdminInviteSetupFormProps {
  email: string;
  flowType: "invite" | "recovery";
}

export function AdminInviteSetupForm({ email, flowType }: AdminInviteSetupFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Your setup session expired. Open the invite link from your email again.");
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      const { error: activateError } = await supabase.rpc("activate_invited_admin");
      if (activateError && !activateError.message.includes("cannot be activated")) {
        if (isMissingActivateRpcError(activateError)) {
          throw new Error(
            "Database setup is incomplete (missing activate_invited_admin). Your Super Admin must run supabase/migrations/015_admin_reliability.sql in Supabase SQL Editor, then try again or sign in with the password you just saved.",
          );
        }
        throw activateError;
      }

      clearAuthHashFromUrl();
      window.location.href = "/admin/requests";
    } catch (err) {
      setError(formatSetupError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <p className="ploy-kicker">Team invite</p>
        <Heading as="h1" size="section">
          {flowType === "invite" ? "Create your password" : "Set a new password"}
        </Heading>
        <p className="text-sm text-[var(--ploy-text-secondary)]">
          Finish setup for <span className="font-medium text-[var(--ploy-text-primary)]">{email}</span>,
          then you&apos;ll go straight to the admin workspace.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-[var(--ploy-radius-xl)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-elevated)] p-8 shadow-[var(--ploy-shadow-sm)]"
      >
        <div className="space-y-2">
          <Label htmlFor="invite-password" required>
            Password
          </Label>
          <Input
            id="invite-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invite-confirm-password" required>
            Confirm password
          </Label>
          <Input
            id="invite-confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            required
          />
        </div>

        {error && (
          <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-3 py-2 text-sm text-[var(--ploy-status-error)]">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Continue to admin"
          )}
        </Button>
      </form>
    </div>
  );
}
