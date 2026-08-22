#!/usr/bin/env node
/**
 * Production smoke test — HTTP checks against the live site.
 *
 * Usage:
 *   node scripts/smoke-production.mjs
 *   BASE_URL=https://your-domain.com node scripts/smoke-production.mjs
 *
 * Optional (requires .env with Supabase keys):
 *   node scripts/smoke-production.mjs --with-supabase
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const BASE_URL = (process.env.BASE_URL ?? "https://dr-akin-platform.vercel.app").replace(/\/$/, "");
const WITH_SUPABASE = process.argv.includes("--with-supabase");

async function fetchRedirectCheck({ name, path, finalPath, status = 200 }) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: { "User-Agent": "dr-akin-smoke/1.0" },
    });
    const location = res.headers.get("location") ?? "";
    const ok =
      (res.status === 301 || res.status === 308) &&
      (location.endsWith(finalPath) || location.includes(finalPath));
    return ok
      ? { name, url, ok: true }
      : { name, url, ok: false, detail: `expected redirect to ${finalPath}, got ${res.status} ${location}` };
  } catch (err) {
    return {
      name,
      url,
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

const REDIRECT_CHECKS = [
  { name: "TC Resource retired redirect", path: "/work/tc-resource-technology", finalPath: "/work" },
  { name: "Insights view canonical redirect", path: "/insights/view?slug=culture-as-strategic-asset", finalPath: "/insights/culture-as-strategic-asset" },
  { name: "Events view canonical redirect", path: "/events/view?slug=performx-summit-2026", finalPath: "/events/performx-summit-2026" },
];

/** @type {{ name: string; path: string; expect?: RegExp; status?: number; manual?: boolean }[]} */
const CHECKS = [
  { name: "Homepage", path: "/", expect: /Akin|Governance|Three pillars/i },
  { name: "Contact", path: "/contact", expect: /enquiry|contact/i },
  { name: "Book Dr Akin", path: "/book-dr-akin", expect: /book|engagement|invitation/i },
  { name: "Track booking", path: "/track-booking", expect: /track|reference|booking/i },
  { name: "Work hub", path: "/work", expect: /work|ecosystem|platform/i },
  { name: "PERFORMX", path: "/work/performx", expect: /performx|PERFORMX/i },
  { name: "Future Africa", path: "/work/future-africa", expect: /Future Africa|Agenda 2063/i },
  { name: "Auctus Africa", path: "/work/auctus-africa", expect: /Auctus|auctusafrica/i },
  { name: "Organizer resources", path: "/organizer-resources", expect: /organizer|approved materials/i },
  { name: "Meet profile", path: "/meet-akin/profile", expect: /1,000,000\+|Special Emissary/i },
  { name: "Speaking", path: "/meet-akin/speaking", expect: /Governance & Leadership|Enterprise Development/i },
  { name: "Insights hub", path: "/insights", expect: /insight|essay|field note/i },
  { name: "Events hub", path: "/events", expect: /event/i },
  { name: "Library hub", path: "/resources", expect: /library|book/i },
  { name: "Privacy", path: "/privacy", expect: /privacy/i },
  { name: "Admin login shell", path: "/admin/login", expect: /admin sign in|sign in/i },
  { name: "Admin requests gate", path: "/admin/requests", expect: /admin|sign in|verifying|requests/i },
  { name: "robots.txt", path: "/robots.txt", expect: /User-agent|Sitemap/i },
  { name: "sitemap index", path: "/sitemap-index.xml", expect: /sitemap|urlset|loc/i },
  { name: "RSS feed", path: "/rss.xml", expect: /rss|channel|item/i },
  { name: "Brand logo (email asset)", path: "/brand/akin-logo-mono.png", status: 200 },
];

async function fetchCheck({ name, path, expect, status = 200 }) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "dr-akin-smoke/1.0" },
    });
    const body = await res.text();
    const okStatus = res.status === status;
    const okBody = expect ? expect.test(body) : true;
    if (okStatus && okBody) {
      return { name, url, ok: true };
    }
    return {
      name,
      url,
      ok: false,
      detail: !okStatus ? `HTTP ${res.status}` : "body marker not found",
    };
  } catch (err) {
    return {
      name,
      url,
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

function parseEnv(filePath) {
  const text = readFileSync(filePath, "utf8");
  const get = (key) =>
    text.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim()?.replace(/^"|"$/g, "") ?? "";
  return { url: get("PUBLIC_SUPABASE_URL"), key: get("PUBLIC_SUPABASE_ANON_KEY") };
}

async function supabaseChecks() {
  const envPath = resolve(import.meta.dirname, "..", ".env");
  if (!existsSync(envPath)) {
    console.log("\n⏭  Supabase checks skipped (.env not found). Use --with-supabase after configuring .env.");
    return [];
  }

  const { url, key } = parseEnv(envPath);
  if (!url || !key) {
    console.log("\n⏭  Supabase checks skipped (PUBLIC_SUPABASE_URL / ANON_KEY missing in .env).");
    return [];
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const results = [];

  const tables = [
    { name: "admin_profiles readable", fn: () => supabase.from("admin_profiles").select("id").limit(1) },
    { name: "enquiries readable", fn: () => supabase.from("enquiries").select("id").limit(1) },
    { name: "booking_requests readable", fn: () => supabase.from("booking_requests").select("id").limit(1) },
  ];

  for (const t of tables) {
    try {
      const { error } = await t.fn();
      results.push({
        name: `Supabase: ${t.name}`,
        ok: !error,
        detail: error?.message,
      });
    } catch (err) {
      results.push({
        name: `Supabase: ${t.name}`,
        ok: false,
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

console.log(`\n🔍 Production smoke test\n   Base URL: ${BASE_URL}\n`);

const httpResults = [];
for (const check of CHECKS) {
  const result = await fetchCheck(check);
  httpResults.push(result);
  console.log(result.ok ? `✅ ${result.name}` : `❌ ${result.name} — ${result.detail}`);
}

for (const check of REDIRECT_CHECKS) {
  const result = await fetchRedirectCheck(check);
  httpResults.push(result);
  console.log(result.ok ? `✅ ${result.name}` : `❌ ${result.name} — ${result.detail}`);
}

let extraResults = [];
if (WITH_SUPABASE) {
  extraResults = await supabaseChecks();
  for (const r of extraResults) {
    console.log(r.ok ? `✅ ${r.name}` : `❌ ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
  }
}

const failed = [...httpResults, ...extraResults].filter((r) => !r.ok);

console.log("\n--- Manual steps (cannot be automated) ---");
console.log("□ Sign in at /admin/login → land on /admin/requests");
console.log("□ Admin → Inbox: list loads (may be empty)");
console.log("□ Submit a test contact enquiry → appears in Inbox");
console.log("□ Submit a test booking → appears in Requests (or tracker with token)");
console.log("□ Sign out from admin");

if (failed.length > 0) {
  console.log(`\n❌ ${failed.length} automated check(s) failed.\n`);
  process.exit(1);
}

console.log("\n✅ All automated HTTP checks passed.");
console.log("   Complete the manual steps above before go-live.\n");
