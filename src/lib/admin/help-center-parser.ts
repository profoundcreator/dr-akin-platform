export type HelpBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 3 | 4; text: string; id: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "blockquote"; text: string }
  | { type: "code"; text: string };

export type HelpSection = {
  id: string;
  title: string;
  blocks: HelpBlock[];
  searchableText: string;
};

export type HelpSearchMatch = {
  sectionId: string;
  sectionTitle: string;
  snippet: string;
  score: number;
};

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\|?[\s:-]+\|[\s|:-]+\|?$/.test(line.trim());
}

function parseBlocks(raw: string): HelpBlock[] {
  const lines = raw.split("\n");
  const blocks: HelpBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed || trimmed === "---") {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      const text = trimmed.slice(4).trim();
      blocks.push({ type: "heading", level: 3, text, id: slugifyHeading(text) });
      index += 1;
      continue;
    }

    if (trimmed.startsWith("#### ")) {
      const text = trimmed.slice(5).trim();
      blocks.push({ type: "heading", level: 4, text, id: slugifyHeading(text) });
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      index += 1;
      const codeLines: string[] = [];
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", text: codeLines.join("\n") });
      index += 1;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        quoteLines.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push({ type: "blockquote", text: quoteLines.join("\n") });
      continue;
    }

    if (trimmed.startsWith("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const headers = parseTableRow(trimmed);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(parseTableRow(lines[index]));
        index += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    index += 1;
    while (index < lines.length) {
      const next = lines[index].trim();
      if (
        !next ||
        next === "---" ||
        next.startsWith("#") ||
        next.startsWith("> ") ||
        next.startsWith("|") ||
        next.startsWith("```") ||
        /^[-*]\s+/.test(next) ||
        /^\d+\.\s+/.test(next)
      ) {
        break;
      }
      paragraphLines.push(next);
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

function blocksToPlainText(blocks: HelpBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "paragraph":
        case "blockquote":
        case "code":
          return block.text;
        case "heading":
          return block.text;
        case "list":
          return block.items.join(" ");
        case "table":
          return [block.headers.join(" "), ...block.rows.map((row) => row.join(" "))].join(" ");
        default:
          return "";
      }
    })
    .join(" ");
}

export function parseHelpCenterMarkdown(markdown: string): HelpSection[] {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  const withoutTitle = normalized.replace(/^#\s+.+\n+/, "");

  const parts = withoutTitle.split(/\n(?=## )/);
  const sections: HelpSection[] = [];

  for (const part of parts) {
    const match = part.match(/^##\s+(.+?)(?:\n([\s\S]*))?$/);
    if (!match) continue;

    const title = match[1].trim();
    const body = match[2]?.trim() ?? "";
    const id = slugifyHeading(title);
    const blocks = parseBlocks(body);

    sections.push({
      id,
      title,
      blocks,
      searchableText: `${title} ${blocksToPlainText(blocks)}`.toLowerCase(),
    });
  }

  return sections;
}

function scoreMatch(text: string, query: string): number {
  if (!query) return 0;
  const lower = text.toLowerCase();
  if (lower === query) return 100;
  if (lower.startsWith(query)) return 80;
  if (lower.includes(` ${query}`)) return 60;
  if (lower.includes(query)) return 40;
  return 0;
}

function buildSnippet(text: string, query: string, radius = 60): string {
  const lower = text.toLowerCase();
  const index = lower.indexOf(query);
  if (index === -1) return text.slice(0, radius * 2).trim();

  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + query.length + radius);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

export function searchHelpSections(
  sections: HelpSection[],
  query: string,
): HelpSearchMatch[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const terms = normalized.split(/\s+/).filter(Boolean);
  const results: HelpSearchMatch[] = [];

  for (const section of sections) {
    let score = scoreMatch(section.title.toLowerCase(), normalized);

    for (const term of terms) {
      if (section.searchableText.includes(term)) {
        score += 20;
      }
    }

    if (score > 0) {
      results.push({
        sectionId: section.id,
        sectionTitle: section.title,
        snippet: buildSnippet(section.searchableText, terms[0] ?? normalized),
        score,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function filterSectionsByQuery(
  sections: HelpSection[],
  query: string,
): HelpSection[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return sections;

  const terms = normalized.split(/\s+/).filter(Boolean);
  return sections.filter((section) =>
    terms.every(
      (term) =>
        section.title.toLowerCase().includes(term) ||
        section.searchableText.includes(term),
    ),
  );
}
