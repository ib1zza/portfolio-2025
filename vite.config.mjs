import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const base =
    process.env.VITE_BASE_PATH ?? (mode === "github" ? "/portfolio-2025/" : "/");
  const publicAssetBase = command === "serve" || base === "/" ? base : "../";

  return {
    base,
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler", { target: "19" }]],
        },
      }),
      svgr(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "script-defer",
        includeAssets: ["favicon.ico", "pwa-icon-192.png", "pwa-icon-512.png", "robots.txt"],
        manifest: {
          short_name: "ib1zza",
          name: "ib1zza portfolio",
          icons: [
            {
              src: "pwa-icon-192.png",
              type: "image/png",
              sizes: "192x192",
              purpose: "any maskable",
            },
            {
              src: "pwa-icon-512.png",
              type: "image/png",
              sizes: "512x512",
              purpose: "any maskable",
            },
          ],
          start_url: ".",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
        },
        workbox: {
          globPatterns: ["assets/**/*.{js,css,woff2,svg,png,webp,ico}", "models/**/*.glb"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/va\.vercel-scripts\.com\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "vercel-analytics",
                expiration: { maxEntries: 10, maxAgeSeconds: 86400 },
              },
            },
          ],
        },
      }),
      {
        name: "generate-seo-files",
        closeBundle() {
          const siteUrl = process.env.VITE_SITE_URL || "https://ib1zza.com";
          const outDir = path.resolve(__dirname, "dist");

          // 1. Generate sitemap.xml
          const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/badge</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
          fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);

          // 2. Generate robots.txt
          const robots = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

Sitemap: ${siteUrl}/sitemap.xml
`;
          fs.writeFileSync(path.join(outDir, "robots.txt"), robots);
        },
      },
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `$public-base: "${publicAssetBase}";
          @use "@/global/styles/vars" as *;
          @use "@/global/styles/mixins" as *;
          `,
        },
      },
    },
    build: {
      sourcemap: false,
      modulePreload: { polyfill: false },
      chunkSizeWarningLimit: 850,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replaceAll("\\", "/");

            if (!normalizedId.includes("node_modules")) return;
            if (
              /node_modules\/(react|react-dom|scheduler|react-reconciler)\//.test(
                normalizedId,
              )
            ) {
              return "react-vendor";
            }
            if (normalizedId.includes("node_modules/@react-three/")) {
              return "react-three";
            }
            if (normalizedId.includes("node_modules/three/")) {
              return "three";
            }
            if (
              /node_modules\/(motion|motion-dom|motion-utils)\//.test(normalizedId)
            ) {
              return "motion-vendor";
            }
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
