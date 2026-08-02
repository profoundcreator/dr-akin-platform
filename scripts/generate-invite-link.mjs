#!/usr/bin/env node
/**
 * Generate an admin invite link without sending email (bypasses Supabase email rate limit).
 *
 * Usage:
 *   node scripts/generate-invite-link.mjs <email> "<full name>" <role>
 *
 * Example:
 *   node scripts/generate-invite-link.mjs someone@example.com "Jane Doe" admin_manager
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, process.argv[2]?.endsWith(".env") ? process.argv[2] : ".env");
const argOffset = process.argv[2]?.endsWith(".env") ? 1 : 0;

const email = (process.argv[2 + argOffset] ?? "").trim().toLowerCase();
const fullName = (process.argv[3 + argOffset] ?? "").trim();
const role = (process.argv[4 + argOffset] ?? "").trim();

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

function parseEnv(filePath) {
  const text = readFileSync(filePath, "utf8");
  const get = (key) =>
    text.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim()?.replace(/^"|"$/g, "") ?? "";

  return {
    url: get("PUBLIC_SUPABASE_URL"),
    service: get("SUPABASE_SERVICE_ROLE_KEY"),
    site: get("PUBLIC_SITE_URL") || "https://dr-akin-platform.vercel.app",
  };
}

function usage() {
  console.error(`
Usage:
  node scripts/generate-invite-link.mjs <email> "<full name>" <role>

Roles: ${[...VALID_ROLES].join(", ")}
`);
}

if (!email || !fullName || !role) {
  usage();
  process.exit(1);
}

if (!VALID_ROLES.has(role)) {
  console.error(`Invalid role: ${role}`);
  usage();
  process.exit(1);
}

if (!existsSync(envPath)) {
  console.error(`Env file not found: ${envPath}`);
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

async function main() {
  const redirectTo = `${env.site.replace(/\/$/, "")}/admin/login`;

  let authUser = await findAuthUserByEmail(admin, email);
  let linkType = "invite";

  if (authUser) {
    linkType = "recovery";
    console.error(`Auth user already exists — generating recovery (password setup) link.`);
  } else {
    console.error(`No auth user yet — generating invite link (creates user, no email sent).`);
  }

  const { data, error } = await admin.auth.admin.generateLink({
    type: linkType,
    email,
    options: {
      redirectTo,
      data: fullName ? { full_name: fullName } : undefined,
    },
  });

  if (error) {
    console.error("generateLink failed:", error.message);
    process.exit(1);
  }

  authUser = data.user ?? authUser;
  if (!authUser?.id) {
    console.error("Could not resolve auth user id after generateLink.");
    process.exit(1);
  }

  const { data: existingProfile } = await admin
    .from("admin_profiles")
    .select("id, account_state, role")
    .eq("id", authUser.id)
    .maybeSingle();

  if (!existingProfile) {
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
      account_state: "invited",
      invited_by: inviter?.id ?? null,
      invited_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("admin_profiles insert failed:", insertError.message);
      process.exit(1);
    }
    console.error("Created admin_profiles row (account_state: invited).");
  } else {
    console.error(
      `admin_profiles already exists (state: ${existingProfile.account_state}, role: ${existingProfile.role}).`,
    );
  }

  const actionLink = data.properties?.action_link;
  if (!actionLink) {
    console.error("No action_link returned.");
    process.exit(1);
  }

  console.log("\n--- Share this link with the invitee (expires — send soon) ---\n");
  console.log(actionLink);
  console.log("\n--- They open it → set password → sign in at /admin/login ---\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
