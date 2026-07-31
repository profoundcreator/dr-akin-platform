const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "a",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
]);

const GLOBAL_STRIP = /<\/?(script|style|iframe|object|embed|form|input|button|textarea|select)[^>]*>/gi;

/** contentEditable often emits div blocks; map them to paragraphs before sanitizing. */
export function normalizeEditorHtml(html: string): string {
  return html
    .replace(/<div(\s[^>]*)?>/gi, "<p>")
    .replace(/<\/div>/gi, "</p>");
}

function stripEventHandlers(html: string): string {
  return html.replace(/\s(on\w+|style)=("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
}

function sanitizeAnchorTag(tag: string): string {
  const hrefMatch = tag.match(/href=("([^"]*)"|'([^']*)'|([^\s>]+))/i);
  if (!hrefMatch) return "";

  const href = (hrefMatch[2] ?? hrefMatch[3] ?? hrefMatch[4] ?? "").trim();
  if (!href || /^\s*javascript:/i.test(href)) return "";

  const safeHref = href.replace(/"/g, "&quot;");
  return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">`;
}

export function sanitizeInsightHtml(html: string): string {
  if (!html.trim()) return "";

  let cleaned = normalizeEditorHtml(html).replace(GLOBAL_STRIP, "");
  cleaned = stripEventHandlers(cleaned);

  return cleaned.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tagName: string, attrs: string) => {
    const tag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";

    if (tag === "a") {
      if (match.startsWith("</")) return "</a>";
      return sanitizeAnchorTag(match);
    }

    if (match.startsWith("</")) return `</${tag}>`;
    if (tag === "br") return "<br>";
    return `<${tag}>`;
  });
}

export function plainTextToInsightHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (/<[a-z][\s\S]*>/i.test(trimmed)) return sanitizeInsightHtml(trimmed);

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.trim().replace(/\n/g, "<br>")}</p>`)
    .join("");
}
