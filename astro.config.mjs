import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

// La URL pública se usa para el enlace canónico, Open Graph y el sitemap.
// Defínela en .env (SITE_URL=https://tudominio.com). En Vercel se toma sola del dominio de producción.
const env = loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), "");
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = env.SITE_URL || process.env.SITE_URL || (vercel ? `https://${vercel}` : undefined);

export default defineConfig({
  site,
  compressHTML: true,
  devToolbar: { enabled: false },
  build: {
    inlineStylesheets: "auto",
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 900,
    },
  },
});
