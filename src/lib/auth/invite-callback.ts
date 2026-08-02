export type InviteCallbackType = "invite" | "recovery";

export function parseAuthHashType(): InviteCallbackType | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const type = params.get("type");
  if (type === "invite" || type === "recovery") return type;
  if (params.get("access_token")) return "invite";
  return null;
}

export function clearAuthHashFromUrl(): void {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
}
