import type { APIRoute } from "astro";
import { PERSON_IDENTITY } from "@/data/person-identity";
import { getPublicInsights } from "@/lib/insights/public-insights";

function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL("https://dr-akin-platform.vercel.app");
  const insights = await getPublicInsights();
  const items = insights.map((article) => {
    const url = new URL(`/insights/${article.slug}`, base).href;
    return [
      "<item>",
      `<title>${xml(article.title)}</title>`,
      `<link>${xml(url)}</link>`,
      `<guid isPermaLink="true">${xml(url)}</guid>`,
      `<description>${xml(article.seoDescription || article.summary)}</description>`,
      article.publishedAt ? `<pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>` : "",
      "</item>",
    ].join("");
  });

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0"><channel>',
    `<title>${xml(PERSON_IDENTITY.publicName)} — Insights</title>`,
    `<link>${xml(new URL("/insights", base).href)}</link>`,
    "<description>Essays and field notes on African governance, enterprise development, education, and leadership.</description>",
    ...items,
    "</channel></rss>",
  ].join("");

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
