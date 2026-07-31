"use client";

import { useEffect, useMemo, useState } from "react";
import { MailPlus, Shield, Users } from "lucide-react";
import { AdminHelpTip } from "@/components/admin/admin-help-tip";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminSetupNotice } from "@/components/admin/admin-setup-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/context/admin-auth-provider";
import { TEAM_ADMIN_COPY } from "@/lib/admin/plain-language-copy";
import {
  canAccessTeamAdmin,
  canEditTeamMember,
  canInviteTeamMembers,
  canMarkFounder,
  formatAdminRole,
  getAssignableTeamRoles,
} from "@/lib/auth/permissions";
import type { AdminAccountState, AdminRole } from "@/lib/supabase/database.types";
import { ACCOUNT_STATE_LABELS, TEAM_ROLE_DESCRIPTIONS } from "@/lib/team/constants";
import {
  getTeamMembers,
  inviteTeamMember,
  isTeamSchemaReady,
  markTeamMemberAsFounder,
  updateTeamMember,
  type TeamMember,
} from "@/lib/team/team-members";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const EMPTY_INVITE = {
  email: "",
  fullName: "",
  role: "executive_assistant" as AdminRole,
};

export function TeamDashboard() {
  const { profile } = useAdminAuth();
  const assignableRoles = useMemo(() => getAssignableTeamRoles(profile), [profile]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaReady, setSchemaReady] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [invite, setInvite] = useState(EMPTY_INVITE);
  const [saving, setSaving] = useState(false);

  const hasFounder = members.some((member) => member.is_founder);
  const canInvite = canInviteTeamMembers(profile);

  async function loadMembers() {
    try {
      setError(null);
      setSchemaReady(await isTeamSchemaReady());
      const team = await getTeamMembers();
      setMembers(team);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load team members");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (assignableRoles.length > 0 && !assignableRoles.includes(invite.role)) {
      setInvite((prev) => ({ ...prev, role: assignableRoles[0] }));
    }
  }, [assignableRoles, invite.role]);

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);

    const result = await inviteTeamMember({
      email: invite.email,
      fullName: invite.fullName,
      role: invite.role,
    });

    if (!result.ok) {
      setError(result.message);
    } else {
      setNotice(result.message);
      setInvite((prev) => ({ ...EMPTY_INVITE, role: prev.role }));
      await loadMembers();
    }

    setSaving(false);
  }

  async function handleStateChange(member: TeamMember, accountState: AdminAccountState) {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await updateTeamMember(member.id, { accountState });
      setNotice(
        accountState === "active"
          ? `${member.full_name} is active again.`
          : `${member.full_name} is now ${ACCOUNT_STATE_LABELS[accountState].toLowerCase()}.`,
      );
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update team member");
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(member: TeamMember, role: AdminRole) {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await updateTeamMember(member.id, { role });
      setNotice(`${member.full_name} is now ${formatAdminRole(role)}.`);
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setSaving(false);
    }
  }

  async function handleResendInvite(member: TeamMember) {
    setSaving(true);
    setError(null);
    setNotice(null);
    const result = await inviteTeamMember({
      email: member.email,
      fullName: member.full_name,
      role: member.role,
      resend: true,
    });
    if (!result.ok) setError(result.message);
    else setNotice(result.message);
    setSaving(false);
  }

  async function handleMarkFounder(member: TeamMember) {
    if (!window.confirm(`Mark ${member.full_name} as the protected founder account? This can only be done once.`)) {
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await markTeamMemberAsFounder(member.id);
      setNotice(`${member.full_name} is now the protected founder account.`);
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark founder");
    } finally {
      setSaving(false);
    }
  }

  if (profile && !canAccessTeamAdmin(profile)) {
    return (
      <AdminLayoutShell title="Team" subtitle={TEAM_ADMIN_COPY.subtitle}>
        <p className="ploy-surface-elevated p-6 text-sm text-[var(--ploy-text-secondary)]">
          You do not have permission to manage team access.
        </p>
      </AdminLayoutShell>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <AdminLayoutShell title="Team" subtitle={TEAM_ADMIN_COPY.subtitle}>
        <p className="ploy-surface-elevated p-6 text-sm text-[var(--ploy-text-secondary)]">
          Connect the back office to manage team access.
        </p>
      </AdminLayoutShell>
    );
  }

  return (
    <AdminLayoutShell title="Team" subtitle={TEAM_ADMIN_COPY.subtitle}>
      {!schemaReady && <AdminSetupNotice variant="team" />}

      {(error || notice) && (
        <div className="mb-4 space-y-2">
          {error && (
            <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-4 py-3 text-sm text-[var(--ploy-status-error)]">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.14_145/0.12)] px-4 py-3 text-sm text-[var(--ploy-status-success)]">
              {notice}
            </p>
          )}
        </div>
      )}

      {canMarkFounder(profile) && !hasFounder && (
        <div className="mb-6 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-4 py-3 text-sm text-[var(--ploy-text-secondary)]">
          {TEAM_ADMIN_COPY.noFounderYet}
        </div>
      )}

      {canInvite && (
        <form className="ploy-surface-elevated mb-8 space-y-5 p-6" onSubmit={handleInvite}>
          <div className="flex items-center gap-2">
            <MailPlus className="size-4 text-[var(--ploy-accent-primary)]" />
            <h2 className="text-lg font-semibold">{TEAM_ADMIN_COPY.inviteTitle}</h2>
            <AdminHelpTip text={TEAM_ADMIN_COPY.inviteHelp} />
          </div>

          <p className="text-sm text-[var(--ploy-text-secondary)]">{TEAM_ADMIN_COPY.serviceRoleMissing}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="team-email" required>
                Email
              </Label>
              <Input
                id="team-email"
                type="email"
                value={invite.email}
                onChange={(e) => setInvite((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="colleague@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-name" required>
                Full name
              </Label>
              <Input
                id="team-name"
                value={invite.fullName}
                onChange={(e) => setInvite((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Jane Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team-role" required>
              Role
            </Label>
            <select
              id="team-role"
              value={invite.role}
              onChange={(e) => setInvite((prev) => ({ ...prev, role: e.target.value as AdminRole }))}
              className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm"
            >
              {assignableRoles.map((role) => (
                <option key={role} value={role}>
                  {formatAdminRole(role)}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--ploy-text-tertiary)]">
              {TEAM_ROLE_DESCRIPTIONS[invite.role]?.summary}
            </p>
          </div>

          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Sending invite…" : "Send invite"}
          </Button>
        </form>
      )}

      <div className="ploy-surface-elevated space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-[var(--ploy-accent-primary)]" />
          <h2 className="text-lg font-semibold">{TEAM_ADMIN_COPY.teamListTitle}</h2>
          <AdminHelpTip text={TEAM_ADMIN_COPY.teamListHelp} />
        </div>

        {loading ? (
          <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading team…</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-[var(--ploy-text-secondary)]">No team members yet.</p>
        ) : (
          <ul className="space-y-4">
            {members.map((member) => {
              const editable = profile ? canEditTeamMember(profile, member) : false;
              const isSelf = profile?.id === member.id;

              return (
                <li
                  key={member.id}
                  className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{member.full_name}</p>
                        {member.is_founder && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.68_0.145_29/0.12)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[var(--ploy-accent-primary)]">
                            <Shield className="size-3" />
                            {TEAM_ADMIN_COPY.founderBadge}
                          </span>
                        )}
                        {isSelf && (
                          <span className="text-xs text-[var(--ploy-text-tertiary)]">(You)</span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--ploy-text-secondary)]">{member.email}</p>
                      <p className="text-xs text-[var(--ploy-text-tertiary)]">
                        {formatAdminRole(member.role)} · {ACCOUNT_STATE_LABELS[member.account_state]}
                      </p>
                      <p className="text-xs text-[var(--ploy-text-tertiary)]">
                        {TEAM_ROLE_DESCRIPTIONS[member.role]?.summary}
                      </p>
                    </div>

                    {editable && (
                      <div className="flex shrink-0 flex-col gap-2">
                        {member.account_state === "invited" && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={saving}
                            onClick={() => handleResendInvite(member)}
                          >
                            Resend invite
                          </Button>
                        )}
                        {member.account_state === "active" && !member.is_founder && (
                          <>
                            <select
                              value={member.role}
                              disabled={saving || member.is_founder}
                              onChange={(e) =>
                                handleRoleChange(member, e.target.value as AdminRole)
                              }
                              className="rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-2 py-1.5 text-xs"
                            >
                              {getAssignableTeamRoles(profile).map((role) => (
                                <option key={role} value={role}>
                                  {formatAdminRole(role)}
                                </option>
                              ))}
                            </select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={saving}
                              onClick={() => handleStateChange(member, "suspended")}
                            >
                              Suspend
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={saving}
                              onClick={() => handleStateChange(member, "revoked")}
                            >
                              Remove access
                            </Button>
                          </>
                        )}
                        {(member.account_state === "suspended" ||
                          member.account_state === "revoked") && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={saving}
                            onClick={() => handleStateChange(member, "active")}
                          >
                            Reactivate
                          </Button>
                        )}
                        {canMarkFounder(profile) &&
                          !hasFounder &&
                          member.role === "super_admin" &&
                          member.account_state === "active" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={saving}
                              onClick={() => handleMarkFounder(member)}
                            >
                              {TEAM_ADMIN_COPY.markFounder}
                            </Button>
                          )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminLayoutShell>
  );
}
