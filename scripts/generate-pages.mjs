#!/usr/bin/env node
/**
 * Creates Astro page stubs for all marketing routes.
 * Run once: node scripts/generate-pages.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const root = resolve(import.meta.dirname, "..");

const pages = [
  { path: "src/pages/work/index.astro", key: "work", component: "WorkHubPage", importFrom: "marketing-page" },
  { path: "src/pages/work/future-africa.astro", key: "work-future-africa" },
  { path: "src/pages/work/aald.astro", key: "work-aald" },
  { path: "src/pages/work/erudio-hub.astro", key: "work-erudio-hub" },
  { path: "src/pages/work/performx.astro", key: "work-performx" },
  { path: "src/pages/work/auctus-africa.astro", key: "work-auctus-africa" },
  { path: "src/pages/meet-akin/index.astro", key: "meet-akin" },
  { path: "src/pages/meet-akin/profile.astro", key: "meet-profile" },
  { path: "src/pages/meet-akin/au-ambassador.astro", key: "meet-au" },
  { path: "src/pages/meet-akin/edu-governance.astro", key: "meet-edu" },
  { path: "src/pages/meet-akin/speaking.astro", key: "meet-speaking" },
  { path: "src/pages/organizer-resources.astro", key: "organizer-resources" },
];

function marketingAstro(key, component = "MarketingPage", importFrom = "marketing-page") {
  return `---
import Layout from "@/layouts/Layout.astro";
import { ${component} } from "@/components/pages/${importFrom}";
import { SITE_PAGES } from "@/data/site-content";

const content = SITE_PAGES["${key}"];
---

<Layout title={content.title} description={content.description}>
  <${component} client:load ${component === "MarketingPage" ? "content={content}" : ""} />
</Layout>
`;
}

for (const page of pages) {
  const fullPath = resolve(root, page.path);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, marketingAstro(page.key, page.component, page.importFrom));
  console.log("Created", page.path);
}

// Resources page
const resourcesPath = resolve(root, "src/pages/resources.astro");
writeFileSync(
  resourcesPath,
  `---
import Layout from "@/layouts/Layout.astro";
import { ResourcesPage } from "@/components/pages/marketing-page";
import { LIBRARY_BOOKS } from "@/data/site-content";
---

<Layout title="Resources — Library & Archives" description="Books, frameworks, and leadership resources from Dr. Akin Akinpelu.">
  <ResourcesPage client:load books={LIBRARY_BOOKS} />
</Layout>
`,
);

// Insights index
mkdirSync(resolve(root, "src/pages/insights"), { recursive: true });
writeFileSync(
  resolve(root, "src/pages/insights/index.astro"),
  `---
import Layout from "@/layouts/Layout.astro";
import { InsightsIndexPage } from "@/components/pages/marketing-page";
import { INSIGHT_ARTICLES } from "@/data/site-content";
---

<Layout title="Insights & Writing" description="Essays and field notes on leadership and transformation.">
  <InsightsIndexPage client:load articles={INSIGHT_ARTICLES} />
</Layout>
`,
);

console.log("Done.");
