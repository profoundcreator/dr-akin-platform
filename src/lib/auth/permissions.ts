import type { AdminProfile, AdminRole } from "@/lib/supabase/database.types";

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  technical_admin: "Technical Admin",
  executive_assistant: "Executive Assistant",
  executive_reviewer: "Executive Reviewer",
  inbox_manager: "Inbox Manager",
  resource_manager: "Resource Manager",
  read_only_auditor: "Read-only Auditor",
};

export const PRIVILEGED_ROLES: AdminRole[] = ["super_admin", "technical_admin"];

export const OPERATIONAL_ROLES: AdminRole[] = [
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

export function formatAdminRole(role: AdminRole): string {
  return ADMIN_ROLE_LABELS[role] ?? role;
}
