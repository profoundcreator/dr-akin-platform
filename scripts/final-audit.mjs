#!/usr/bin/env node
/**
 * Continental content transformation — final verification gate.
 *
 * Usage:
 *   node scripts/final-audit.mjs
 *   node scripts/final-audit.mjs --dist   # also scan built HTML in dist/
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";

const ROOT = resolve(import.meta.dirname, "..");
const SCAN_DIST = process.argv.includes("--dist");

const LEGACY_PATTERNS = [
  { id: "people-700k", pattern: /700,000|700000/, allow: ["ploy-backup.md", "docs/"] },
  { id: "years-15", pattern: /15\+ years/, allow: ["ploy-backup.md", "docs/"] },
  { id: "four-operating-arms", pattern: /four operating arms/i, allow: ["ploy-backup.md", "docs/"] },
  { id: "technology-alliances", pattern: /technology alliances/i, allow: ["ploy-backup.md", "docs/"] },
  { id: "old-au-title", pattern: /AU Agenda 2063 Ambassador|Agenda 2063 Ambassador/i, allow: ["ploy-backup.md", "docs/"] },
  { id: "tc-resource-nav", pattern: /tc-resource-technology|TC Resource Technology/i, allow: ["ploy-backup.md", "docs/", "vercel.json", "migrations/"] },
  { id: "high-perf-theme", pattern: /High Performance & Execution/i, allow: ["ploy-backup.md", "docs/"] },
];

const REQUIRED_FILES = [
  "src/data/person-identity.ts",
  "src/data/ecosystem.ts",
  "src/data/site-contact.ts",
  "src/pages/contact.astro",
  "src/pages/privacy.astro",
  "src/pages/organizer-resources.astro",
  "src/pages/work/[slug].astro",
  "docs/content-strategy/continental-copy-deck.md",
  "docs/content-strategy/architecture-impact-and-rollout.md",
  "supabase/migrations/018_organizer_resources.sql",
  "supabase/migrations/019_contact_geo_foundation.sql",
  "supabase/migrations/020_continental_ecosystem.sql",
];

const REQUIRED_DIST_PAGES = [
  "dist/index.html",
  "dist/work/index.html",
  "dist/work/future-africa/index.html",
  "dist/work/auctus-africa/index.html",
  "dist/contact/index.html",
  "dist/privacy/index.html",
  "dist/organizer-resources/index.html",
  "dist/meet-akin/profile/index.html",
  "dist/meet-akin/speaking/index.html",
];

const REQUIRED_IDENTITY = [
  "Akin Akinpelu, Ph.D., Amb., FLPi",
  "Special Emissary, African Union",
  "1,000,000+",
  "26+",
  "20+",
];

const PUBLIC_WORK_SLUGS = ["future-africa", "aald", "performx", "erudio-hub", "auctus-africa"];

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === "node_modules" || entry === ".git" || entry === "dist") continue;
      walk(full, files);
    } else if (/\.(tsx?|astro|mjs|ts|sql|json)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function isAllowed(path, allowPrefixes) {
  const rel = path.replace(`${ROOT}/`, "");
  return allowPrefixes.some((prefix) => rel.startsWith(prefix) || rel.includes(prefix));
}

function scanLegacyReferences() {
  const files = walk(join(ROOT, "src")).concat(walk(join(ROOT, "api")));
  const failures = [];

  for (const file of files) {
    const rel = file.replace(`${ROOT}/`, "");
    const text = readFileSync(file, "utf8");
    for (const { id, pattern, allow = [] } of LEGACY_PATTERNS) {
      if (!pattern.test(text)) continue;
      if (isAllowed(rel, allow)) continue;
      // tc_resource enum in types/constants is intentional
      if (id === "tc-resource-nav" && /tc_resource/.test(text) && !/tc-resource-technology|TC Resource Technology/i.test(text)) {
        continue;
      }
      failures.push({ id, file: rel, match: text.match(pattern)?.[0] ?? "" });
    }
  }

  return failures;
}

function checkRequiredFiles() {
  return REQUIRED_FILES.filter((rel) => !existsSync(join(ROOT, rel))).map((rel) => ({
    id: "missing-file",
    file: rel,
    match: "required artifact missing",
  }));
}

function checkIdentityModule() {
  const path = join(ROOT, "src/data/person-identity.ts");
  const text = readFileSync(path, "utf8");
  return REQUIRED_IDENTITY.filter((value) => !text.includes(value)).map((value) => ({
    id: "identity-value",
    file: "src/data/person-identity.ts",
    match: `missing ${value}`,
  }));
}

function checkWorkStaticSlugs() {
  const path = join(ROOT, "src/data/ecosystem.ts");
  const text = readFileSync(path, "utf8");
  return PUBLIC_WORK_SLUGS.filter((slug) => !text.includes(slug)).map((slug) => ({
    id: "work-slug",
    file: "src/data/ecosystem.ts",
    match: `missing ${slug}`,
  }));
}

function checkVercelRedirect() {
  const vercel = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));
  const failures = [];
  const redirect = vercel.redirects?.find((r) => r.source === "/work/tc-resource-technology");
  if (!redirect || redirect.destination !== "/work" || !redirect.permanent) {
    failures.push({ id: "tc-redirect", file: "vercel.json", match: "TC permanent redirect missing or misconfigured" });
  }
  const slugRewrites = (vercel.rewrites ?? []).filter((r) =>
    /insights|events|library|work/.test(String(r.source)),
  );
  if (slugRewrites.length > 0) {
    failures.push(...slugRewrites.map((r) => ({
      id: "slug-rewrite",
      file: "vercel.json",
      match: `content slug rewrite still present: ${r.source}`,
    })));
  }
  return failures;
}

function checkLegacyViewRedirects() {
  const vercel = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));
  const failures = [];
  for (const source of ["/insights/view", "/events/view", "/library/view", "/work/view"]) {
    const section = source.split("/")[1];
    const viewRedirect = vercel.redirects?.find((r) => r.source === source);
    const hasSlugCapture = viewRedirect?.has?.some(
      (h) => h.type === "query" && h.key === "slug" && String(h.value).includes("?<slug>"),
    );
    const destination = viewRedirect?.destination ?? "";
    if (!hasSlugCapture || destination !== `/${section}/:slug`) {
      failures.push({
        id: "view-redirect",
        file: "vercel.json",
        match: `expected /${section}/view?slug=… → /${section}/:slug redirect`,
      });
    }
  }
  return failures;
}

function checkDist() {
  if (!existsSync(join(ROOT, "dist"))) {
    return [{ id: "dist-missing", file: "dist/", match: "run npm run build before --dist audit" }];
  }

  const failures = [];
  for (const rel of REQUIRED_DIST_PAGES) {
    if (!existsSync(join(ROOT, rel))) {
      failures.push({ id: "dist-page", file: rel, match: "built page missing" });
    }
  }

  const workIndex = readFileSync(join(ROOT, "dist/work/index.html"), "utf8");
  if (!/Three strategic pillars|three pillars/i.test(workIndex)) {
    failures.push({ id: "work-copy", file: "dist/work/index.html", match: "pillar framing not found" });
  }
  if (/tc-resource|TC Resource/i.test(workIndex)) {
    failures.push({ id: "work-tc", file: "dist/work/index.html", match: "TC Resource still referenced" });
  }

  const profile = readFileSync(join(ROOT, "dist/meet-akin/profile/index.html"), "utf8");
  if (!profile.includes("1,000,000+") || !profile.includes("Special Emissary, African Union")) {
    failures.push({ id: "profile-meta", file: "dist/meet-akin/profile/index.html", match: "canonical metrics/title missing" });
  }

  const speaking = readFileSync(join(ROOT, "dist/meet-akin/speaking/index.html"), "utf8");
  const speakingText = speaking.replace(/&amp;/g, "&");
  for (const theme of ["Governance & Leadership", "Enterprise Development", "Education & Youth Empowerment"]) {
    if (!speakingText.includes(theme)) {
      failures.push({ id: "speaking-theme", file: "dist/meet-akin/speaking/index.html", match: `missing theme: ${theme}` });
    }
  }

  const privacy = readFileSync(join(ROOT, "dist/privacy/index.html"), "utf8");
  if (!/Nigeria Data Protection|privacy notice|data subject/i.test(privacy)) {
    failures.push({ id: "privacy-copy", file: "dist/privacy/index.html", match: "privacy foundation copy missing" });
  }

  const booking = readFileSync(join(ROOT, "dist/book-dr-akin/index.html"), "utf8");
  if (!booking.includes('name="robots" content="noindex, nofollow"')) {
    failures.push({ id: "booking-noindex", file: "dist/book-dr-akin/index.html", match: "booking page not noindexed" });
  }

  for (const rel of REQUIRED_DIST_PAGES) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) continue;
    const html = readFileSync(full, "utf8");
    const og = html.match(/property="og:image" content="([^"]+)"/)?.[1] ?? "";
    if (og.endsWith(".svg")) {
      failures.push({ id: "og-svg", file: rel, match: `og:image uses SVG: ${og}` });
    }
    if (!html.includes('property="og:url"') || !html.includes('name="twitter:image"')) {
      failures.push({ id: "social-meta", file: rel, match: "missing og:url or twitter:image" });
    }
  }

  const indexHtml = readFileSync(join(ROOT, "dist/index.html"), "utf8");
  if (!indexHtml.includes('"@type":"Person"') && !indexHtml.includes('"@type": "Person"')) {
    failures.push({ id: "jsonld-person", file: "dist/index.html", match: "Person JSON-LD missing on homepage" });
  }

  return failures;
}

function runBuild() {
  try {
    execSync("npm run build", { cwd: ROOT, stdio: "pipe" });
    return [];
  } catch (err) {
    const output = err instanceof Error && "stdout" in err ? String(err.stdout) : String(err);
    return [{ id: "build", file: "npm run build", match: output.split("\n").slice(-5).join(" ") }];
  }
}

console.log("\n🔎 Continental transformation — final audit\n");

const sections = [
  { name: "Required artifacts", fn: checkRequiredFiles },
  { name: "Canonical identity module", fn: checkIdentityModule },
  { name: "Ecosystem work slugs", fn: checkWorkStaticSlugs },
  { name: "Legacy reference scan (src/api)", fn: scanLegacyReferences },
  { name: "Vercel routing", fn: checkVercelRedirect },
  { name: "Legacy /view redirects", fn: checkLegacyViewRedirects },
];

if (SCAN_DIST) {
  sections.push({ name: "Production build", fn: runBuild });
  sections.push({ name: "Built HTML verification", fn: checkDist });
} else {
  console.log("Tip: run with --dist after `npm run build` for HTML/metadata checks.\n");
}

const allFailures = [];
for (const section of sections) {
  const failures = section.fn();
  if (failures.length === 0) {
    console.log(`✅ ${section.name}`);
  } else {
    console.log(`❌ ${section.name}`);
    for (const f of failures) {
      console.log(`   • [${f.id}] ${f.file}: ${f.match}`);
      allFailures.push(f);
    }
  }
}

if (allFailures.length > 0) {
  console.log(`\n❌ Final audit failed — ${allFailures.length} issue(s).\n`);
  process.exit(1);
}

console.log("\n✅ Final audit passed.\n");
