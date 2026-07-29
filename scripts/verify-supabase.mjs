#!/usr/bin/env node
/**
 * Verifies Supabase env vars are set. Run after copying .env.example → .env
 * Usage: node scripts/verify-supabase.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env");

if (!existsSync(envPath)) {
  console.error("❌ .env not found. Run: cp .env.example .env");
  process.exit(1);
}

const env = readFileSync(envPath, "utf8");
const url = env.match(/^PUBLIC_SUPABASE_URL=(.+)$/m)?.[1]?.trim();
const key = env.match(/^PUBLIC_SUPABASE_ANON_KEY=(.+)$/m)?.[1]?.trim();

if (!url || url.includes("your-project")) {
  console.error("❌ PUBLIC_SUPABASE_URL is not configured in .env");
  process.exit(1);
}

if (!key || key.includes("your-anon")) {
  console.error("❌ PUBLIC_SUPABASE_ANON_KEY is not configured in .env");
  process.exit(1);
}

console.log("✅ Supabase environment variables are set");
console.log(`   URL: ${url}`);
