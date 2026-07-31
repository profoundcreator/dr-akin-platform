import type { AdminProfile, AdminRole } from "@/lib/supabase/database.types";

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

export function formatAdminRole(role: AdminRole): string {
  return ADMIN_ROLE_LABELS[role] ?? role;
}
