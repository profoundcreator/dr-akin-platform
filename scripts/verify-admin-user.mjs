#!/usr/bin/env node
/**
 * Verify an admin user's auth + profile linkage in Supabase.
 * Usage: node scripts/verify-admin-user.mjs "email@example.com"
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");

function readEnv() {
  if (!existsSync(envPath)) {
    console.error("❌ Missing .env — run npm run setup:env first.");
    process.exit(1);
  }
  const text = readFileSync(envPath, "utf8");
  const get = (key) =>
    text.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim()?.replace(/^"|"$/g, "") ?? "";
  return {
    url: get("PUBLIC_SUPABASE_URL"),
    service: get("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!email) {
  console.error("Usage: node scripts/verify-admin-user.mjs \"admin@example.com\"");
  process.exit(1);
}

const env = readEnv();
if (!env.url || !env.service) {
  console.error("❌ Set PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(env.url, env.service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: users, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error("❌ Could not list auth users:", listError.message);
  process.exit(1);
}

const authUser = users.users.find((u) => u.email?.toLowerCase() === email);
if (!authUser) {
  console.error(`❌ No auth.users row for ${email}`);
  process.exit(1);
}

console.log(`✅ Auth user: ${authUser.id}`);
console.log(`   email_confirmed_at: ${authUser.email_confirmed_at ?? "(not confirmed)"}`);

const { data: profile, error: profileError } = await supabase
  .from("admin_profiles")
  .select("id, email, full_name, role, account_state, session_revoked_at")
  .eq("id", authUser.id)
  .maybeSingle();

if (profileError) {
  console.error("❌ admin_profiles query failed:", profileError.message);
  process.exit(1);
}

if (!profile) {
  console.error("❌ No admin_profiles row linked to this auth user.");
  console.error("\nFix (Super Admin, Supabase SQL Editor):");
  console.error(`INSERT INTO admin_profiles (id, email, full_name, role, account_state, invited_at)`);
  console.error(`VALUES ('${authUser.id}', '${email}', 'Admin User', 'super_admin', 'active', now());`);
  process.exit(1);
}

console.log("✅ admin_profiles row found:");
console.log(`   role: ${profile.role}`);
console.log(`   account_state: ${profile.account_state}`);
console.log(`   session_revoked_at: ${profile.session_revoked_at ?? "(none)"}`);

if (profile.id !== authUser.id) {
  console.error("❌ Profile id does not match auth user id.");
  process.exit(1);
}

if (profile.account_state !== "active") {
  console.warn(`⚠️  account_state is "${profile.account_state}" — user may not sign in until active.`);
  console.warn(`   UPDATE admin_profiles SET account_state = 'active', session_revoked_at = NULL WHERE id = '${authUser.id}';`);
  process.exit(1);
}

if (profile.session_revoked_at) {
  console.warn("⚠️  session_revoked_at is set — clear it or sign in after clearing:");
  console.warn(`   UPDATE admin_profiles SET session_revoked_at = NULL WHERE id = '${authUser.id}';`);
  process.exit(1);
}

console.log("\n✅ Admin user looks ready for sign-in.");
