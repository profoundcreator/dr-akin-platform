import type { AdminProfile, AdminRole } from "@/lib/supabase/database.types";
import {
  OPERATIONAL_TEAM_ROLES,
  PRIVILEGED_TEAM_ROLES,
} from "@/lib/team/constants";

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  admin_manager: "Admin Manager",
  technical_admin: "Technical Admin",
  executive_assistant: "Executive Assistant",
  executive_reviewer: "Executive Reviewer",
  inbox_manager: "Inbox Manager",
  resource_manager: "Resource Manager",
  read_only_auditor: "Read-only Auditor",
};

export const PRIVILEGED_ROLES: AdminRole[] = ["super_admin", "technical_admin"];

export const EVENT_APPROVER_ROLES: AdminRole[] = [
  "super_admin",
  "executive_assistant",
  "admin_manager",
];

export const OPERATIONAL_ROLES: AdminRole[] = [
  "admin_manager",
  "executive_assistant",
  "executive_reviewer",
  "inbox_manager",
  "resource_manager",
];

export function canAccessAdmin(profile: AdminProfile | null): boolean {
  return profile?.account_state === "active";
}

export function isPrivilegedAdmin(profile: AdminProfile | null): boolean {
  return (
    profile?.account_state === "active" &&
    PRIVILEGED_ROLES.includes(profile.role)
  );
}

export function canManageUsers(profile: AdminProfile | null): boolean {
  return isPrivilegedAdmin(profile);
}

export function canAccessTeamAdmin(profile: AdminProfile | null): boolean {
  if (!canAccessAdmin(profile)) return false;
  return (
    profile!.role === "super_admin" ||
    profile!.role === "technical_admin" ||
    profile!.role === "admin_manager"
  );
}

export function canInviteTeamMembers(profile: AdminProfile | null): boolean {
  return canAccessTeamAdmin(profile);
}

export function getAssignableTeamRoles(profile: AdminProfile | null): AdminRole[] {
  if (!canAccessAdmin(profile)) return [];
  if (PRIVILEGED_TEAM_ROLES.includes(profile!.role)) {
    return [...PRIVILEGED_TEAM_ROLES, ...OPERATIONAL_TEAM_ROLES];
  }
  if (profile!.role === "admin_manager") {
    return OPERATIONAL_TEAM_ROLES;
  }
  return [];
}

export function canEditTeamMember(
  actor: AdminProfile | null,
  target: AdminProfile,
): boolean {
  if (!canAccessTeamAdmin(actor) || !actor) return false;
  if (target.is_founder && actor.id !== target.id) return false;
  if (PRIVILEGED_TEAM_ROLES.includes(actor.role)) return true;
  if (actor.role === "admin_manager") {
    return OPERATIONAL_TEAM_ROLES.includes(target.role);
  }
  return false;
}

export function canMarkFounder(profile: AdminProfile | null): boolean {
  return profile?.account_state === "active" && profile.role === "super_admin";
}

export function canWriteBookings(profile: AdminProfile | null): boolean {
  if (!canAccessAdmin(profile)) return false;
  return profile!.role !== "read_only_auditor";
}

export function canCreateEvents(profile: AdminProfile | null): boolean {
  return canWriteBookings(profile);
}

export function canApproveEvents(profile: AdminProfile | null): boolean {
  return (
    canAccessAdmin(profile) &&
    EVENT_APPROVER_ROLES.includes(profile!.role)
  );
}

export function canManageInbox(profile: AdminProfile | null): boolean {
  if (!canAccessAdmin(profile)) return false;
  return (
    profile!.role === "super_admin" ||
    profile!.role === "admin_manager" ||
    profile!.role === "inbox_manager" ||
    profile!.role === "executive_assistant"
  );
}

export function canManageResources(profile: AdminProfile | null): boolean {
  if (!canAccessAdmin(profile)) return false;
  return (
    profile!.role === "super_admin" ||
    profile!.role === "admin_manager" ||
    profile!.role === "resource_manager" ||
    profile!.role === "executive_assistant"
  );
}

export function canUploadResources(profile: AdminProfile | null): boolean {
  if (!canAccessAdmin(profile)) return false;
  return (
    profile!.role === "super_admin" ||
    profile!.role === "admin_manager" ||
    profile!.role === "resource_manager"
  );
}

export function canAssignResources(profile: AdminProfile | null): boolean {
  if (!canAccessAdmin(profile)) return false;
  return (
    profile!.role === "super_admin" ||
    profile!.role === "admin_manager" ||
    profile!.role === "executive_assistant"
  );
}

export function canOverrideResourceGrants(profile: AdminProfile | null): boolean {
  if (!canAccessAdmin(profile)) return false;
  return profile!.role === "super_admin" || profile!.role === "admin_manager";
}

export function canManageHomepage(profile: AdminProfile | null): boolean {
  return canApproveEvents(profile);
}

export function canApproveBooks(profile: AdminProfile | null): boolean {
  return canApproveEvents(profile);
}

export function canPermanentlyDeleteBooks(profile: AdminProfile | null): boolean {
  if (!canAccessAdmin(profile)) return false;
  return profile!.role === "super_admin" || profile!.role === "admin_manager";
}

export function canApproveInsights(profile: AdminProfile | null): boolean {
  return canApproveEvents(profile);
}

export function canPermanentlyDeleteInsights(profile: AdminProfile | null): boolean {
  return canPermanentlyDeleteBooks(profile);
}

export function canApproveWorkOrgs(profile: AdminProfile | null): boolean {
  return canApproveEvents(profile);
}

export function canReviewContentPlans(profile: AdminProfile | null): boolean {
  return canApproveWorkOrgs(profile);
}

/** Any operational admin can open the planning workspace; approvers can edit and sign off. */
export function canAccessContentPlans(profile: AdminProfile | null): boolean {
  if (!canAccessAdmin(profile)) return false;
  return profile!.role !== "read_only_auditor";
}

export function canPermanentlyDeleteWorkOrgs(profile: AdminProfile | null): boolean {
  return canPermanentlyDeleteBooks(profile);
}

export function canAccessAuditLog(profile: AdminProfile | null): boolean {
  if (!canAccessAdmin(profile)) return false;
  return (
    profile!.role === "super_admin" ||
    profile!.role === "technical_admin" ||
    profile!.role === "read_only_auditor"
  );
}

export function canExportAuditLog(profile: AdminProfile | null): boolean {
  if (!canAccessAdmin(profile)) return false;
  return profile!.role === "super_admin" || profile!.role === "technical_admin";
}

export function formatAdminRole(role: AdminRole): string {
  return ADMIN_ROLE_LABELS[role] ?? role;
}
