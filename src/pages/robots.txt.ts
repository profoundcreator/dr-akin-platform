import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const base = site ?? "https://dr-akin-platform.vercel.app";
  const sitemapUrl = new URL("sitemap-index.xml", base).href;

  const body = ["User-agent: *", "Allow: /", "", `Sitemap: ${sitemapUrl}`, ""].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
