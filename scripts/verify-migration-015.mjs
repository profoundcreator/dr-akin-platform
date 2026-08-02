#!/usr/bin/env node
/**
 * Checks that migration 015_admin_reliability.sql has been applied.
 * Usage: node scripts/verify-migration-015.mjs [.env]
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
    service: get("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

const env = parseEnv(envPath);
if (!env.url || !env.service) {
  console.error("❌ Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(env.url, env.service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let failed = false;

async function checkRpc(name) {
  const { error } = await admin.rpc(name);
  const message = error?.message ?? "";

  if (message.includes("Could not find the function")) {
    console.error(`❌ ${name} — missing (run supabase/migrations/015_admin_reliability.sql)`);
    failed = true;
    return;
  }

  if (message.includes("Authentication required") || message.includes("Admin profile not found")) {
    console.log(`✅ ${name} — exists`);
    return;
  }

  console.log(`✅ ${name} — exists (${message || "ok"})`);
}

console.log(`\nChecking migration 015 via ${envPath}\n`);
await checkRpc("activate_invited_admin");

console.log(
  failed
    ? "\n❌ Migration 015 is incomplete. Run supabase/migrations/015_admin_reliability.sql in Supabase SQL Editor.\n"
    : "\n✅ activate_invited_admin exists. If auditors can still edit bookings, run the full 015 file for RLS policy updates.\n",
);
process.exit(failed ? 1 : 0);
