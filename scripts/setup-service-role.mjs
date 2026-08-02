#!/usr/bin/env node
/**
 * Validates and optionally syncs Supabase service_role key to .env and Vercel.
 * Run: npm run setup:service-role
 */
import { createInterface } from "node:readline";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");

function parseEnv(filePath) {
  const text = readFileSync(filePath, "utf8");
  const get = (key) =>
    text.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim()?.replace(/^"|"$/g, "") ?? "";
  return {
    url: get("PUBLIC_SUPABASE_URL"),
    anon: get("PUBLIC_SUPABASE_ANON_KEY"),
    service: get("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

function decodeJwt(key) {
  try {
    return JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString());
  } catch {
    return null;
  }
}

function upsertEnvValue(key, value) {
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const line = `${key}=${value}`;
  const keyPattern = new RegExp(`^${key}=.*$`, "m");

  if (keyPattern.test(content)) {
    content = content.replace(keyPattern, line);
  } else {
    if (content.length > 0 && !content.endsWith("\n")) {
      content += "\n";
    }
    content += `${line}\n`;
  }

  writeFileSync(envPath, content);
}

async function validateServiceKey(url, anon, service) {
  const servicePayload = decodeJwt(service);
  if (servicePayload?.role !== "service_role") {
    throw new Error(
      `That key is not a service_role key (JWT role="${servicePayload?.role ?? "invalid"}"). Use Supabase → Settings → API → service_role secret.`,
    );
  }

  const anonPayload = decodeJwt(anon);
  if (anonPayload?.ref && servicePayload?.ref && anonPayload.ref !== servicePayload.ref) {
    throw new Error("Service role key belongs to a different Supabase project than your anon key.");
  }

  if (anon && service === anon) {
    throw new Error("Service role key must not be the same as the anon public key.");
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) {
    throw new Error(`Supabase rejected the service role key: ${error.message}`);
  }
}

function syncToVercel(serviceKey) {
  console.log("\n  Syncing SUPABASE_SERVICE_ROLE_KEY to Vercel (Production + Preview)…");

  for (const target of ["production", "preview"]) {
    spawnSync("npx", ["vercel", "env", "rm", "SUPABASE_SERVICE_ROLE_KEY", target, "--yes"], {
      cwd: root,
      stdio: "inherit",
    });

    const addArgs =
      target === "preview"
        ? ["vercel", "env", "add", "SUPABASE_SERVICE_ROLE_KEY", "preview", "--force"]
        : ["vercel", "env", "add", "SUPABASE_SERVICE_ROLE_KEY", "production", "--force"];

    const add = spawnSync("npx", addArgs, {
      cwd: root,
      input: `${serviceKey}\n`,
      stdio: ["pipe", "inherit", "inherit"],
    });

    if (add.status !== 0) {
      throw new Error(`Failed to add SUPABASE_SERVICE_ROLE_KEY to Vercel (${target}).`);
    }
  }

  console.log("  ✅ Vercel environment updated.");
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolveAsk) => rl.question(q, resolveAsk));

console.log("\n  Dr. Akin Platform — service role setup\n");
console.log("  Supabase Dashboard → your project → Settings → API");
console.log("  Copy the service_role secret (NOT the anon public key).\n");

if (!existsSync(envPath)) {
  console.error("  ❌ .env not found. Run npm run setup:env first.\n");
  process.exit(1);
}

const env = parseEnv(envPath);
if (!env.url || !env.anon) {
  console.error("  ❌ .env is missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY.\n");
  process.exit(1);
}

console.log(`  Project URL: ${env.url}`);
console.log(`  Anon key:    ${env.anon.slice(0, 10)}…${env.anon.slice(-8)}\n`);

const pasted = (await ask("  Paste service_role secret: ")).trim();
rl.close();

if (!pasted || pasted.length < 20) {
  console.error("\n  ❌ That key looks too short.\n");
  process.exit(1);
}

try {
  await validateServiceKey(env.url, env.anon, pasted);
  console.log("\n  ✅ Service role key validated against Supabase.");
} catch (error) {
  console.error(`\n  ❌ ${error instanceof Error ? error.message : error}\n`);
  process.exit(1);
}

upsertEnvValue("SUPABASE_SERVICE_ROLE_KEY", pasted);
console.log("  ✅ Saved SUPABASE_SERVICE_ROLE_KEY to .env");

try {
  syncToVercel(pasted);
} catch (error) {
  console.error(`\n  ⚠️  ${error instanceof Error ? error.message : error}`);
  console.error("  You can still add the key manually in Vercel → Environment Variables.\n");
  process.exit(1);
}

console.log("\n  Next: redeploy production so the API picks up the new key.");
console.log("  Vercel → Deployments → Redeploy (or run: npx vercel deploy --prod)\n");
