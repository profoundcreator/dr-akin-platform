#!/usr/bin/env node
/**
 * Vercel Hobby plan allows at most 12 Serverless Functions per deployment.
 * Every .ts file directly under api/ counts. Helpers must live outside api/ (see server/lib/).
 *
 * Run: node scripts/check-vercel-function-count.mjs
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HOBBY_LIMIT = 12;
const root = join(fileURLToPath(import.meta.url), "..", "..");
const apiDir = join(root, "api");

const files = readdirSync(apiDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
  .map((entry) => entry.name)
  .sort();

const count = files.length;
const headroom = HOBBY_LIMIT - count;

console.log(`Vercel Serverless Functions under api/: ${count} / ${HOBBY_LIMIT} (headroom ${headroom})`);
for (const file of files) console.log(`  • api/${file}`);

if (count > HOBBY_LIMIT) {
  console.error(
    `\n❌ ${count} > ${HOBBY_LIMIT}: deployment will FAIL on Vercel Hobby.\n` +
      "Move shared code to server/lib/ (not under api/).",
  );
  process.exit(1);
}

console.log(`✅ within the Hobby ${HOBBY_LIMIT}-function limit.`);
