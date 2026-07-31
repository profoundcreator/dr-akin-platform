export type AdminRole =
  | "super_admin"
  | "technical_admin"
  | "admin_manager"
  | "executive_assistant"
  | "executive_reviewer"
  | "inbox_manager"
  | "resource_manager"
  | "read_only_auditor";

export type AdminAccountState = "invited" | "active" | "suspended" | "revoked";
