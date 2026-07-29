#!/usr/bin/env node
/**
 * Interactive .env setup — paste your Supabase credentials when prompted.
 * Run: npm run setup:env
 */
import { createInterface } from "node:readline";
import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(import.meta.dirname, "..", ".env");

const rl = createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

console.log("\n  Dr. Akin Platform — Supabase setup\n");
console.log("  Get your values from:");
console.log("  Supabase Dashboard → your project → Settings → API\n");
console.log("  You need:");
console.log("    1. Project URL   (starts with https://)");
console.log("    2. anon public key   (long string — NOT service_role)\n");

const url = await ask("  Paste Project URL: ");
const key = await ask("  Paste anon public key: ");

rl.close();

const trimmedUrl = url.trim();
const trimmedKey = key.trim();

if (!trimmedUrl.startsWith("https://") || trimmedUrl.includes("your-project")) {
  console.error("\n  ❌ That URL doesn't look right. It should look like:");
  console.error("     https://abcdefghijklmnop.supabase.co\n");
  process.exit(1);
}

if (trimmedKey.length < 20 || trimmedKey.includes("your-anon")) {
  console.error("\n  ❌ That key doesn't look right. Use the 'anon' 'public' key from API settings.\n");
  process.exit(1);
}

const content = `# Supabase — configured ${new Date().toISOString().slice(0, 10)}
PUBLIC_SUPABASE_URL=${trimmedUrl}
PUBLIC_SUPABASE_ANON_KEY=${trimmedKey}
`;

writeFileSync(envPath, content);
console.log("\n  ✅ Saved to .env");
console.log("  Next: run  npm run verify:supabase  to confirm\n");
