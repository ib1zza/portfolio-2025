import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const base =
    process.env.VITE_BASE_PATH ?? (mode === "github" ? "/portfolio-2025/" : "/");
  const publicAssetBase = command === "serve" || base === "/" ? base : "../";

  return {
    base,
    plugins: [react(), svgr()],
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

            return "vendor";
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
