export function readEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function readEnvBool(name: string, defaultValue = false): boolean {
  const raw = readEnv(name).toLowerCase();
  if (!raw) return defaultValue;
  return raw === "1" || raw === "true" || raw === "yes";
}

export function siteUrl(): string {
  return (readEnv("PUBLIC_SITE_URL") || "https://dr-akin-platform.vercel.app").replace(/\/$/, "");
}
