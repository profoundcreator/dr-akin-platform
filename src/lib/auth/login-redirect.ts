const LOGIN_ERROR_KEY = "admin_login_error";

export function stashAdminLoginError(message: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LOGIN_ERROR_KEY, message);
  } catch {
    /* ignore storage failures */
  }
}

export function consumeAdminLoginError(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const message = sessionStorage.getItem(LOGIN_ERROR_KEY);
    if (message) sessionStorage.removeItem(LOGIN_ERROR_KEY);
    return message;
  } catch {
    return null;
  }
}

export function redirectToAdminLogin(reason?: string | null): void {
  if (reason) stashAdminLoginError(reason);
  window.location.replace("/admin/login");
}
