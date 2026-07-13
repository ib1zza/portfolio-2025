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

          const ROUTE_METADATA = {
            "": {
              title: "ib1zza",
              description: "Interactive 3D portfolio by Mikhail (ib1zza) — a retro Macintosh desktop experience built with React & Three.js",
              ogTitle: "Mikhail (ib1zza) — Classic Macintosh Portfolio",
            },
            projects: {
              title: "Projects — ib1zza",
              description: "Browse the web applications, utility tools, and interactive 3D graphics projects built by Mikhail (ib1zza).",
              ogTitle: "Projects — Mikhail (ib1zza)",
            },
            about: {
              title: "About Me — ib1zza",
              description: "Learn more about Mikhail (ib1zza), frontend engineer and creative developer. Skills, stack, and interests.",
              ogTitle: "About Me — Mikhail (ib1zza)",
            },
            education: {
              title: "Education — ib1zza",
              description: "Educational background, university studies, and certifications of frontend engineer Mikhail (ib1zza).",
              ogTitle: "Education — Mikhail (ib1zza)",
            },
            contact: {
              title: "Contact & Links — ib1zza",
              description: "Get in touch with Mikhail (ib1zza) via Telegram, Github, Email, and social platforms.",
              ogTitle: "Contact — Mikhail (ib1zza)",
            },
            "icon-painter": {
              title: "Icon Painter — ib1zza",
              description: "Draw pixel art icons in a classic Macintosh Finder-style editor. Save, export, and customize desktop items.",
              ogTitle: "Icon Painter — Classic Macintosh Editor",
            },
            "dither-studio": {
              title: "Dither Studio — ib1zza",
              description: "Upload images and apply retro 1-bit or custom dither algorithms in real time. Perfect retro game art generation.",
              ogTitle: "Dither Studio — Retro Dithering Tool",
            },
            "dither-camera": {
              title: "Dither Camera — ib1zza",
              description: "Capture retro style 1-bit dithered photos directly using your webcam in this classic retro Mac camera app.",
              ogTitle: "Dither Camera — 1-bit Dither Camera",
            },
            "model-viewer": {
              title: "3D Model Viewer — ib1zza",
              description: "View and interact with 3D retro models using classic wireframe and flat rendering filters.",
              ogTitle: "3D Model Viewer — Retro 3D Graphics",
            },
            "badge-generator": {
              title: "Badge Generator — ib1zza",
              description: "Generate retro-style badges, stickers, and credentials. Custom layouts, colors, and graphics export.",
              ogTitle: "Badge Generator — Retro Sticker Creator",
            },
            "audio-player": {
              title: "Audio Player — ib1zza",
              description: "Listen to lo-fi retro audio tunes in a Winamp-inspired classic Mac audio player component.",
              ogTitle: "Audio Player — Retro Tunes Player",
            },
            "video-player": {
              title: "Video Player — ib1zza",
              description: "Play vintage video files inside a QuickTime-style classic player component.",
              ogTitle: "Video Player — Classic Movie Player",
            },
            "space-invaders": {
              title: "Space Invaders — ib1zza",
              description: "Play a classic 80s arcade Space Invaders game cloned for retro Macintosh aesthetic.",
              ogTitle: "Space Invaders — Retro Macintosh Game",
            },
            assistant: {
              title: "AI Assistant — ib1zza",
              description: "Ask Mac assistant about Mikhail's projects, experience, stack, and easter eggs in this retro terminal chat.",
              ogTitle: "AI Assistant — Interactive Mac Terminal",
            },
            badge: {
              title: "Badge — ib1zza",
              description: "Create and customize your developer badge in this retro card generator.",
              ogTitle: "Developer Badge Creator — ib1zza",
            },
          };

          const routes = Object.keys(ROUTE_METADATA);

          // 1. Generate sitemap.xml
          const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route ? "/" + route : "/"}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route === "" ? "1.0" : "0.8"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;
          fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);

          // 2. Generate robots.txt
          const robots = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Disallow:

Sitemap: ${siteUrl}/sitemap.xml
`;
          fs.writeFileSync(path.join(outDir, "robots.txt"), robots);

          // 3. Generate pre-rendered HTML files for each route to inject correct SEO metadata
          const htmlPath = path.join(outDir, "index.html");
          if (fs.existsSync(htmlPath)) {
            const baseHtml = fs.readFileSync(htmlPath, "utf-8");

            // @ts-ignore
            const customizeHtml = (html, route, meta) => {
              let result = html;
              const routePath = route ? `${route}/` : "";

              // Replace Title
              result = result.replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`);

              // Replace Description
              result = result.replace(
                /<meta\s+name="description"[\s\S]*?content="[\s\S]*?"\s*\/?>/i,
                `<meta name="description" content="${meta.description}" />`
              );

              // Replace Canonical Link
              result = result.replace(
                /<link\s+rel="canonical"[\s\S]*?href="[\s\S]*?"\s*\/?>/i,
                `<link rel="canonical" href="${siteUrl}/${routePath}" />`
              );

              // Replace OG URL
              result = result.replace(
                /<meta\s+property="og:url"[\s\S]*?content="[\s\S]*?"\s*\/?>/i,
                `<meta property="og:url" content="${siteUrl}/${routePath}" />`
              );

              // Replace OG Title
              result = result.replace(
                /<meta\s+property="og:title"[\s\S]*?content="[\s\S]*?"\s*\/?>/i,
                `<meta property="og:title" content="${meta.ogTitle}" />`
              );

              // Replace OG Description
              result = result.replace(
                /<meta\s+property="og:description"[\s\S]*?content="[\s\S]*?"\s*\/?>/i,
                `<meta property="og:description" content="${meta.description}" />`
              );

              // Replace Twitter URL
              result = result.replace(
                /<meta\s+property="twitter:url"[\s\S]*?content="[\s\S]*?"\s*\/?>/i,
                `<meta property="twitter:url" content="${siteUrl}/${routePath}" />`
              );

              // Replace Twitter Title
              result = result.replace(
                /<meta\s+property="twitter:title"[\s\S]*?content="[\s\S]*?"\s*\/?>/i,
                `<meta property="twitter:title" content="${meta.ogTitle}" />`
              );

              // Replace Twitter Description
              result = result.replace(
                /<meta\s+property="twitter:description"[\s\S]*?content="[\s\S]*?"\s*\/?>/i,
                `<meta property="twitter:description" content="${meta.description}" />`
              );

              // Replace JSON-LD URL
              result = result.replace(
                /"url":\s*"[^"]*"/g,
                `"url": "${siteUrl}/${routePath.replace(/\/$/, "")}"`
              );

              return result;
            };

            for (const route of routes) {
              // @ts-ignore
              const meta = ROUTE_METADATA[route];
              const customizedHtml = customizeHtml(baseHtml, route, meta);

              if (route === "") {
                // Overwrite root index.html
                fs.writeFileSync(htmlPath, customizedHtml);
              } else {
                // Create subfolder and write index.html inside it
                const targetDir = path.join(outDir, route);
                if (!fs.existsSync(targetDir)) {
                  fs.mkdirSync(targetDir, { recursive: true });
                }
                fs.writeFileSync(path.join(targetDir, "index.html"), customizedHtml);
              }
            }
          }
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
