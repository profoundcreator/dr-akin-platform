/** Google Analytics 4 measurement ID (public — appears in page source). Override via PUBLIC_GA_MEASUREMENT_ID. */
export const GA_MEASUREMENT_ID =
  import.meta.env.PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-02E4PJFDFS";

/** Load GA on public marketing pages only — not admin back office. */
export function shouldLoadGoogleAnalytics(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return false;
  return GA_MEASUREMENT_ID.length > 0;
}
