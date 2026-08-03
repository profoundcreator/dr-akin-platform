#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, process.argv[2] ?? ".env");

function parseEnv(filePath) {
  const text = readFileSync(filePath, "utf8");
  const get = (key) =>
    text.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim()?.replace(/^"|"$/g, "") ?? "";
  return { url: get("PUBLIC_SUPABASE_URL"), key: get("PUBLIC_SUPABASE_ANON_KEY") };
}

if (!existsSync(envPath)) {
  console.error(`Missing env: ${envPath}`);
  process.exit(1);
}

const { url, key } = parseEnv(envPath);
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { data, error } = await supabase.from("booking_requests").select("id, reference, form_data, status");
if (error) {
  console.error("Query failed:", error.message);
  process.exit(1);
}

const required = ["name", "organization", "email", "eventTitle", "engagementType", "format", "country", "city"];
let bad = 0;

for (const row of data ?? []) {
  const form = row.form_data;
  const missing = [];
  if (!form || typeof form !== "object") missing.push("form_data null/invalid");
  else {
    for (const field of required) {
      if (form[field] == null || form[field] === "") missing.push(field);
    }
  }
  if (missing.length) {
    bad++;
    console.log(`BAD ${row.reference} (${row.id}): ${missing.join(", ")}`);
  }
}

console.log(`\nChecked ${data?.length ?? 0} rows, ${bad} malformed.`);
