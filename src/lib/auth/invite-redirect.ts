/** Path invitees land on after clicking the Supabase email link. */
export const ADMIN_INVITE_LOGIN_PATH = "/admin/login";

/** Production site URL from Astro public env (set PUBLIC_SITE_URL in Vercel). */
export function getPublicSiteUrl(): string {
  const fromEnv = import.meta.env.PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return "";
}

export function getAdminInviteLoginUrl(): string {
  const site = getPublicSiteUrl();
  return site ? `${site}${ADMIN_INVITE_LOGIN_PATH}` : ADMIN_INVITE_LOGIN_PATH;
}
