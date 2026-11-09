// Sitemap de una sola página. Necesita SITE_URL o el dominio de Vercel para las URL absolutas.
import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const urls = site
    ? `  <url>
    <loc>${new URL("/", site).href}</loc>
    <lastmod>2026-11-07</lastmod>
  </url>
`
    : "";
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
