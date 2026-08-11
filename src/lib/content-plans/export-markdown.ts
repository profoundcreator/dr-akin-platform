import type { ContentPlanData } from "@/lib/content-plans/types";

function formatBullets(bullets?: string[]): string {
  if (!bullets?.length) return "";
  return bullets.map((b) => `- ${b}`).join("\n");
}

function formatSectionApproval(status: string): string {
  if (status === "approved") return "Approved";
  if (status === "revise") return "Revise";
  return "Pending";
}

export function exportPlanToMarkdown(plan: ContentPlanData): string {
  const lines: string[] = [
    `# ${plan.title}`,
    "",
    `> Exported planning snapshot. Status: **${plan.status.replace("_", " ")}**`,
    plan.updatedAt ? `> Last updated: ${plan.updatedAt}` : "",
    "",
    "## Route map",
    "",
    "| Route | Purpose |",
    "| ----- | ------- |",
    "| `/work/aald` | Evergreen AALD corporate page |",
    "| `/work/performx` | Evergreen PerformX Nexus ecosystem |",
    "| `/events/performx-summit-2026` | Summit 2026 edition page |",
    "",
    "## Source hierarchy",
    "",
    "1. AALD brochure PDF",
    "2. PerformX Nexus brochure extract",
    "3. PerformX Summit 2026 concept note",
    "4. continental-copy-deck.md identity rules",
    "",
    "## Variables register",
    "",
    "| Variable | Value | Recommended | Alternate | Source | Status |",
    "| -------- | ----- | ----------- | --------- | ------ | ------ |",
  ];

  for (const variable of Object.values(plan.variables)) {
    lines.push(
      `| \`${variable.key}\` | ${variable.value} | ${variable.recommended} | ${variable.alternate ?? "—"} | ${variable.source} | ${variable.status} |`,
    );
  }

  lines.push("", "## Decisions matrix", "");

  for (const decision of Object.values(plan.decisions)) {
    const selected = decision.options.find((o) => o.id === decision.choice);
    lines.push(`### ${decision.title}`, "", decision.context, "");
    for (const option of decision.options) {
      const marker = option.id === decision.choice ? "x" : " ";
      const rec = option.recommended ? " *(recommended)*" : "";
      lines.push(`- [${marker}] ${option.label}${rec}`);
    }
    if (decision.notes.trim()) {
      lines.push("", `**Notes:** ${decision.notes.trim()}`);
    }
    lines.push("");
  }

  lines.push("## Page plans", "");

  for (const page of plan.pages) {
    lines.push(`### ${page.title}`, "", `**Route:** ${page.route}`, "");
    lines.push("#### Hero", "");
    lines.push(`- **Kicker:** ${page.hero.kicker}`);
    lines.push(`- **Headline:** ${page.hero.headline}`);
    if (page.hero.headlineSecondary) {
      lines.push(`- **Headline secondary:** ${page.hero.headlineSecondary}`);
    }
    lines.push(`- **Description:** ${page.hero.description}`);
    if (page.hero.ctaLabel && page.hero.ctaHref) {
      lines.push(`- **Primary CTA:** ${page.hero.ctaLabel} → ${page.hero.ctaHref}`);
    }
    if (page.hero.secondaryCtaLabel && page.hero.secondaryCtaHref) {
      lines.push(
        `- **Secondary CTA:** ${page.hero.secondaryCtaLabel} → ${page.hero.secondaryCtaHref}`,
      );
    }
    lines.push("");

    for (const section of page.sections) {
      const approval =
        plan.sectionApprovals[section.id] ?? section.status;
      lines.push(`#### ${section.title}`, "");
      lines.push(`**Approval:** ${formatSectionApproval(approval)}`, "");
      lines.push(section.body, "");
      const bullets = formatBullets(section.bullets);
      if (bullets) lines.push(bullets, "");
    }
  }

  lines.push("## Approval checklist", "");

  for (const item of Object.values(plan.checklist)) {
    const marker = item.checked ? "x" : " ";
    lines.push(`- [${marker}] ${item.label}`);
  }

  if (plan.approvalNote.trim()) {
    lines.push("", "## Approval note", "", plan.approvalNote.trim());
  }

  lines.push(
    "",
    "## Implementation sequence",
    "",
    "1. Confirm all decisions and checklist items above.",
    "2. Update `work_orgs` rows for `aald` and `performx` plus static fallbacks in `site-content.ts`.",
    "3. Update PERFORMX summary in `ecosystem.ts`.",
    "4. Seed and publish `performx-summit-2026` event.",
    "5. Run smoke tests on all three routes and cross-links.",
    "",
  );

  return lines.filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n");
}

export function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
