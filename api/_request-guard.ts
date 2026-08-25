import { siteUrl } from "./_env.js";

function normalizeHost(url: string): string | null {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
}

function addHostAliases(hosts: Set<string>, host: string): void {
  const normalized = host.toLowerCase();
  hosts.add(normalized);
  if (normalized.startsWith("www.")) {
    hosts.add(normalized.slice(4));
  } else if (!normalized.includes("localhost") && !normalized.startsWith("127.")) {
    hosts.add(`www.${normalized}`);
  }
}

function allowedHosts(): Set<string> {
  const hosts = new Set<string>();

  const primary = normalizeHost(siteUrl());
  if (primary) addHostAliases(hosts, primary);

  const vercel = (process.env.VERCEL_URL ?? "").trim().replace(/^https?:\/\//, "");
  if (vercel) addHostAliases(hosts, vercel);

  addHostAliases(hosts, "localhost");
  hosts.add("127.0.0.1");

  return hosts;
}

function requestHost(request: Request): string | null {
  const fromUrl = normalizeHost(request.url);
  if (fromUrl) return fromUrl;

  const headerHost = request.headers.get("host")?.split(":")[0]?.trim().toLowerCase();
  return headerHost || null;
}

/** Reject cross-site POSTs to public notification endpoints. */
export function isSameSiteRequest(request: Request): boolean {
  const allowed = allowedHosts();

  const origin = request.headers.get("origin");
  if (origin) {
    const host = normalizeHost(origin);
    return host !== null && allowed.has(host);
  }

  const referer = request.headers.get("referer");
  if (referer) {
    const host = normalizeHost(referer);
    return host !== null && allowed.has(host);
  }

  // Same-origin fetch (e.g. admin email preview) often omits Origin/Referer.
  const secFetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (secFetchSite === "same-origin" || secFetchSite === "same-site") {
    const host = requestHost(request);
    return host !== null && allowed.has(host);
  }

  // Non-browser clients without Origin/Referer are rejected.
  return false;
}

export function readBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  return token || null;
}

export function hasValidStatusProbeKey(request: Request, expected: string): boolean {
  if (!expected) return false;
  const header = request.headers.get("x-notifications-status-key")?.trim();
  if (header && header === expected) return true;
  const query = new URL(request.url).searchParams.get("key")?.trim();
  return query === expected;
}
