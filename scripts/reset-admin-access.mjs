#!/usr/bin/env node
/**
 * Diagnose and repair admin sign-in for a team member (e.g. EA).
 * Sets a temporary password, confirms email, and activates admin_profiles.
 *
 * Usage:
 *   node scripts/reset-admin-access.mjs <email> ["Full Name"] [role]
 *
 * Examples:
 *   node scripts/reset-admin-access.mjs ea@theakinakinpelu.org "EA Team" executive_assistant
 *
 * Requires in .env (or environment):
 *   PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { randomBytes } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const VALID_ROLES = new Set([
  "super_admin",
  "technical_admin",
  "admin_manager",
  "executive_assistant",
  "executive_reviewer",
  "inbox_manager",
  "resource_manager",
  "read_only_auditor",
]);

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");

function parseEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const text = readFileSync(filePath, "utf8");
  const get = (key) =>
    process.env[key]?.trim() ||
    text.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim()?.replace(/^"|"$/g, "") ||
    "";
  return {
    url: get("PUBLIC_SUPABASE_URL"),
    service: get("SUPABASE_SERVICE_ROLE_KEY"),
    site: get("PUBLIC_SITE_URL") || "https://dr-akin-platform.vercel.app",
  };
}

function generateTempPassword() {
  const word = randomBytes(9).toString("base64url");
  return `Akin-${word}!`;
}

async function findAuthUserByEmail(client, targetEmail) {
  let page = 1;
  while (page <= 20) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === targetEmail);
    if (match) return match;
    if (data.users.length < 200) break;
    page += 1;
  }
  return null;
}

function printDiagnosis(label, value) {
  console.log(`  ${label}: ${value}`);
}

async function main() {
  const email = (process.argv[2] ?? "").trim().toLowerCase();
  const fullName = (process.argv[3] ?? "Executive Assistant").trim();
  const role = (process.argv[4] ?? "executive_assistant").trim();

  if (!email) {
    console.error(
      'Usage: node scripts/reset-admin-access.mjs <email> ["Full Name"] [role]',
    );
    process.exit(1);
  }

  if (!VALID_ROLES.has(role)) {
    console.error(`Invalid role: ${role}`);
    process.exit(1);
  }

  const env = parseEnv(envPath);
  if (!env.url || !env.service) {
    console.error("Missing PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  const admin = createClient(env.url, env.service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tempPassword = generateTempPassword();
  const loginUrl = `${env.site.replace(/\/$/, "")}/admin/login`;

  console.log(`\nAdmin access reset — ${email}\n`);

  let authUser = await findAuthUserByEmail(admin, email);

  if (!authUser) {
    console.log("No auth user found — creating one with temporary password…");
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: fullName ? { full_name: fullName } : undefined,
    });
    if (error) throw error;
    authUser = data.user;
  } else {
    printDiagnosis("Auth user id", authUser.id);
    printDiagnosis("Email confirmed", authUser.email_confirmed_at ?? "(not confirmed — fixing)");
    printDiagnosis("Last sign in", authUser.last_sign_in_at ?? "(never)");

    const { data, error } = await admin.auth.admin.updateUserById(authUser.id, {
      password: tempPassword,
      email_confirm: true,
    });
    if (error) throw error;
    authUser = data.user;
  }

  const { data: profile, error: profileError } = await admin
    .from("admin_profiles")
    .select("id, email, full_name, role, account_state, session_revoked_at")
    .eq("id", authUser.id)
    .maybeSingle();

  if (profileError) throw profileError;

  if (!profile) {
    console.log("No admin_profiles row — creating executive assistant profile…");
    const { data: inviter } = await admin
      .from("admin_profiles")
      .select("id")
      .eq("role", "super_admin")
      .eq("account_state", "active")
      .limit(1)
      .maybeSingle();

    const { error: insertError } = await admin.from("admin_profiles").insert({
      id: authUser.id,
      email,
      full_name: fullName,
      role,
      account_state: "active",
      invited_by: inviter?.id ?? null,
      invited_at: new Date().toISOString(),
      session_revoked_at: null,
    });
    if (insertError) throw insertError;
  } else {
    printDiagnosis("Profile role", profile.role);
    printDiagnosis("Profile state (before)", profile.account_state);
    printDiagnosis("Session revoked", profile.session_revoked_at ?? "(none)");

    const { error: updateError } = await admin
      .from("admin_profiles")
      .update({
        email,
        full_name: profile.full_name || fullName,
        role: profile.role || role,
        account_state: "active",
        session_revoked_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authUser.id);

    if (updateError) throw updateError;
  }

  const { data: finalProfile } = await admin
    .from("admin_profiles")
    .select("role, account_state")
    .eq("id", authUser.id)
    .single();

  console.log("\n--- Ready for sign-in ---\n");
  console.log(`Login URL:  ${loginUrl}`);
  console.log(`Email:      ${email}`);
  console.log(`Password:   ${tempPassword}`);
  console.log(`Role:       ${finalProfile?.role ?? role}`);
  console.log(`State:      ${finalProfile?.account_state ?? "active"}`);
  console.log("\nShare the password securely. Ask them to change it after first sign-in.");
  console.log("(Supabase Auth → Users → user → Send password recovery, if they prefer a reset link.)\n");
}

main().catch((error) => {
  console.error("\n❌", error instanceof Error ? error.message : error);
  process.exit(1);
});
