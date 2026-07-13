import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getFileSystemItemIdFromPath, getItemPathFromId } from "./routing";

describe("Routing Utilities", () => {
  describe("getFileSystemItemIdFromPath", () => {
    it("should resolve exact mappings", () => {
      expect(getFileSystemItemIdFromPath("/projects")).toBe("projects");
      expect(getFileSystemItemIdFromPath("/icon-painter")).toBe("iconPainter");
      expect(getFileSystemItemIdFromPath("/assistant")).toBe("portfolioAssistant");
    });

    it("should handle slashes and casing", () => {
      expect(getFileSystemItemIdFromPath("projects/")).toBe("projects");
      expect(getFileSystemItemIdFromPath("About")).toBe("about");
      expect(getFileSystemItemIdFromPath("/education/")).toBe("education");
    });

    it("should fallback to exact ID match case-insensitively", () => {
      // test exact ID fallback
      expect(getFileSystemItemIdFromPath("/aboutReadme")).toBe("aboutReadme");
      expect(getFileSystemItemIdFromPath("/ABOUTREADME")).toBe("aboutReadme");
    });

    it("should fallback to fuzzy path normalization match", () => {
      // test normalization (e.g. project-section-1 matching project-section-1 ID)
      expect(getFileSystemItemIdFromPath("/about-readme")).toBe("aboutReadme");
    });

    it("should return null for unrecognized paths", () => {
      expect(getFileSystemItemIdFromPath("/")).toBeNull();
      expect(getFileSystemItemIdFromPath("/unknown-random-path")).toBeNull();
    });
  });

  describe("getItemPathFromId", () => {
    it("should resolve mapping path from ID", () => {
      expect(getItemPathFromId("projects")).toBe("projects");
      expect(getItemPathFromId("iconPainter")).toBe("icon-painter");
      expect(getItemPathFromId("portfolioAssistant")).toBe("assistant");
    });

    it("should default to lowercase ID if no mapping exists", () => {
      expect(getItemPathFromId("aboutReadme")).toBe("aboutreadme");
    });
  });

  describe("Sitemap and Meta Integrity Check", () => {
    it("should have matching routes in routing.ts and vite.config.mjs", () => {
      const configPath = path.resolve(__dirname, "../../vite.config.mjs");
      const configContent = fs.readFileSync(configPath, "utf-8");

      // Extract the ROUTE_METADATA block
      const metadataBlock = configContent.match(/const\s+ROUTE_METADATA[^=]*=\s*\{([\s\S]*?)\n\s*\};/);
      expect(metadataBlock).not.toBeNull();

      if (metadataBlock) {
        // Extract all keys from ROUTE_METADATA (only top-level route keys followed by an object opening brace)
        const keyRegex = /(?:\s*([a-zA-Z0-9_-]+)|"([a-zA-Z0-9_-]+)")\s*:\s*\{/g;
        const configRoutes: string[] = [];
        let match;
        while ((match = keyRegex.exec(metadataBlock[1])) !== null) {
          const key = match[1] || match[2];
          if (key && key !== "") {
            configRoutes.push(key);
          }
        }

        // Extract mapped routes in routing.ts by reading its code
        const routingPath = path.resolve(__dirname, "./routing.ts");
        const routingContent = fs.readFileSync(routingPath, "utf-8");
        const mappingBlock = routingContent.match(/const\s+PATH_TO_ITEM_ID[^=]*=\s*\{([\s\S]*?)\n\s*\};/);
        expect(mappingBlock).not.toBeNull();

        const routingRoutes: string[] = [];
        if (mappingBlock) {
          const routeMatchRegex = /(?:\s*([a-zA-Z0-9_-]+)|"([a-zA-Z0-9_-]+)")\s*:/g;
          let rMatch;
          while ((rMatch = routeMatchRegex.exec(mappingBlock[1])) !== null) {
            const key = rMatch[1] || rMatch[2];
            if (key) {
              routingRoutes.push(key);
            }
          }
        }

        // Exclusions:
        // - "trash" is a virtual folder on the desktop, not indexed in SEO
        // - "badge" is a standalone route from App.tsx, not in routing.ts fileSystem
        const routingForSEO = routingRoutes.filter((r) => r !== "trash");
        const configForRouting = configRoutes.filter((c) => c !== "badge");

        // Verify that routing paths map 1-to-1 to SEO configuration
        expect(routingForSEO.sort()).toEqual(configForRouting.sort());
      }
    });
  });
});
