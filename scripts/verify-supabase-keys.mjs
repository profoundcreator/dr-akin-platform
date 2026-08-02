#!/usr/bin/env node
/**
 * Validates Supabase anon + service_role keys (JWT role claims + live API probe).
 * Usage:
 *   node scripts/verify-supabase-keys.mjs              # reads .env
 *   node scripts/verify-supabase-keys.mjs .env.vercel.production
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, process.argv[2] ?? ".env");

if (!existsSync(envPath)) {
  console.error(`❌ Env file not found: ${envPath}`);
  process.exit(1);
}

function parseEnv(filePath) {
  const text = readFileSync(filePath, "utf8");
  const get = (key) =>
    text.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim()?.replace(/^"|"$/g, "") ?? "";

  return {
    url: get("PUBLIC_SUPABASE_URL"),
    anon: get("PUBLIC_SUPABASE_ANON_KEY"),
    service: get("SUPABASE_SERVICE_ROLE_KEY"),
    site: get("PUBLIC_SITE_URL"),
  };
}

function decodeJwt(key) {
  if (!key || key === "[SENSITIVE]" || key.includes("your-")) return null;
  try {
    return JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString());
  } catch {
    return null;
  }
}

function mask(key) {
  if (!key) return "(missing)";
  return `${key.slice(0, 10)}…${key.slice(-8)}`;
}

const env = parseEnv(envPath);
let failed = false;

console.log(`\nChecking ${envPath}\n`);

if (!env.url || env.url.includes("your-project") || env.url === "[SENSITIVE]") {
  console.error("❌ PUBLIC_SUPABASE_URL is missing or still a placeholder.");
  failed = true;
} else {
  console.log(`✅ PUBLIC_SUPABASE_URL set (${env.url})`);
}

if (!env.anon || env.anon.includes("your-anon")) {
  console.error("❌ PUBLIC_SUPABASE_ANON_KEY is missing or still a placeholder.");
  failed = true;
} else {
  const anonPayload = decodeJwt(env.anon);
  if (anonPayload?.role !== "anon") {
    console.error(`❌ PUBLIC_SUPABASE_ANON_KEY JWT role is "${anonPayload?.role ?? "invalid"}", expected "anon".`);
    failed = true;
  } else {
    console.log(`✅ PUBLIC_SUPABASE_ANON_KEY looks valid (role=anon, ${mask(env.anon)})`);
  }
}

if (!env.service || env.service.includes("your-service")) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing or still a placeholder.");
  failed = true;
} else if (env.anon === "[SENSITIVE]" || env.service === "[SENSITIVE]") {
  console.warn("⚠️  Vercel pulled [SENSITIVE] placeholders — run npm run setup:service-role to set the real service_role key.");
  failed = true;
} else if (env.anon && env.service === env.anon) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is identical to PUBLIC_SUPABASE_ANON_KEY — use the service_role secret instead.");
  failed = true;
} else {
  const servicePayload = decodeJwt(env.service);
  if (servicePayload?.role !== "service_role") {
    console.error(
      `❌ SUPABASE_SERVICE_ROLE_KEY JWT role is "${servicePayload?.role ?? "invalid"}", expected "service_role".`,
    );
    failed = true;
  } else {
    console.log(`✅ SUPABASE_SERVICE_ROLE_KEY looks valid (role=service_role, ${mask(env.service)})`);
  }
}

if (env.anon && env.service) {
  const anonRef = decodeJwt(env.anon)?.ref;
  const serviceRef = decodeJwt(env.service)?.ref;
  if (anonRef && serviceRef && anonRef !== serviceRef) {
    console.error(`❌ Keys belong to different Supabase projects (${anonRef} vs ${serviceRef}).`);
    failed = true;
  } else if (anonRef) {
    console.log(`✅ Both keys target Supabase project ref: ${anonRef}`);
  }
}

if (!failed && env.url && env.service) {
  const admin = createClient(env.url, env.service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) {
    console.error(`❌ Service role API probe failed: ${error.message}`);
    failed = true;
  } else {
    console.log("✅ Service role key accepted by Supabase Auth admin API");
  }
}

if (env.site) {
  console.log(`✅ PUBLIC_SITE_URL set (${env.site})`);
} else {
  console.warn("⚠️  PUBLIC_SITE_URL not set (invite email redirects may fall back to VERCEL_URL).");
}

console.log(failed ? "\nResult: FAILED — fix the items above, then redeploy on Vercel.\n" : "\nResult: OK\n");
process.exit(failed ? 1 : 0);
