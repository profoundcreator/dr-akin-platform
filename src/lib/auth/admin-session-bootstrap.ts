let inviteSetupActive = false;

/** True while an invitee is setting a password on /admin/login — do not activate or sign out. */
export function setInviteSetupActive(active: boolean): void {
  inviteSetupActive = active;
}

export function isInviteSetupActive(): boolean {
  return inviteSetupActive;
}

const BOOTSTRAP_USER_KEY = "admin_auth_bootstrap_user";

/** After a successful password sign-in, skip one failed profile race on the next page. */
export function stashAdminBootstrapUser(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BOOTSTRAP_USER_KEY, userId);
  } catch {
    /* ignore */
  }
}

export function consumeAdminBootstrapUser(userId: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const match = sessionStorage.getItem(BOOTSTRAP_USER_KEY) === userId;
    if (match) sessionStorage.removeItem(BOOTSTRAP_USER_KEY);
    return match;
  } catch {
    return false;
  }
}

export function clearAdminBootstrapUser(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(BOOTSTRAP_USER_KEY);
  } catch {
    /* ignore */
  }
}
