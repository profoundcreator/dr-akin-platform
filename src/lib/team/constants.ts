import type { AdminAccountState, AdminRole } from "@/lib/supabase/database.types";

export const ACCOUNT_STATE_LABELS: Record<AdminAccountState, string> = {
  invited: "Invite sent",
  active: "Active",
  suspended: "Suspended",
  revoked: "Access removed",
};

export const TEAM_ROLE_DESCRIPTIONS: Record<
  AdminRole,
  { summary: string; canInvite: "privileged" | "operational" | "none" }
> = {
  super_admin: {
    summary: "Full back-office control, including team management and permanent deletes.",
    canInvite: "privileged",
  },
  technical_admin: {
    summary: "Full technical access for developers and platform support.",
    canInvite: "privileged",
  },
  admin_manager: {
    summary: "Approves content, manages inbox/resources, and can manage operational team roles.",
    canInvite: "operational",
  },
  executive_assistant: {
    summary: "Manages booking requests, inbox, events, and content approvals.",
    canInvite: "none",
  },
  executive_reviewer: {
    summary: "Reviews booking requests without changing published site content.",
    canInvite: "none",
  },
  inbox_manager: {
    summary: "Handles enquiries and inbox messages.",
    canInvite: "none",
  },
  resource_manager: {
    summary: "Manages library/resources content areas.",
    canInvite: "none",
  },
  read_only_auditor: {
    summary: "View-only access for oversight and audits.",
    canInvite: "none",
  },
};

export const OPERATIONAL_TEAM_ROLES: AdminRole[] = [
  "admin_manager",
  "executive_assistant",
  "executive_reviewer",
  "inbox_manager",
  "resource_manager",
  "read_only_auditor",
];

export const PRIVILEGED_TEAM_ROLES: AdminRole[] = ["super_admin", "technical_admin"];
