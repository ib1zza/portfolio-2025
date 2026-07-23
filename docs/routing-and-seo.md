# SPA Routing & SEO Pre-rendering

[← Back to README](./README.md)

This document describes the design, implementation, and maintenance of the path-based routing (deep-linking) system and the dynamic SEO pre-rendering process in the Macintosh Portfolio.

---

## 1. Client-Side SPA Routing & Deep-Linking

Since the portfolio operates as a desktop metaphor Single Page Application (SPA), it does not use a traditional router (like `react-router-dom`). Instead, it uses custom state synchronization in the `Desktop` component linked with the browser's address bar history (`window.history`).

### Path Translation

The file [routing.ts](file:///h:/portfolio-2025/src/utils/routing.ts) contains utility mapping helpers:

- `getFileSystemItemIdFromPath(path)`: Translates path slugs (e.g. `/icon-painter` or `/about`) to file system item IDs (e.g. `iconPainter` or `about`). Includes case-insensitive ID matching and character normalization to handle arbitrary paths gracefully.
- `getItemPathFromId(id)`: Translates file system item IDs back into URL-friendly slugs.

### Window to URL Sync

Inside the `DesktopContent` component in [Desktop.tsx](file:///h:/portfolio-2025/src/components/Desktop/Desktop.tsx):

- **On Mount (URL to Window):** A `useEffect` executes once. It checks the initial pathname from `initialPathRef.current`. If it matches a folder, file, or application, it opens the matching window using the watch-cursor opening animation.
- **On Focus Change (Window to URL):** A second `useEffect` subscribes to the active `focusedWindowId`. When a window receives focus, the URL path is pushed to history (e.g. `/projects`). When all windows are closed, the path reverts to `/`.

### Race Condition Mitigation

To prevent the window-to-URL sync from immediately clearing or overwriting the address bar path during the page load and mount cycle:

1. `initialPathRef` captures `window.location.pathname` synchronously on first render.
2. `hasRoutedRef` is initialized to `false`.
3. The window-to-URL sync effect is disabled until `hasRoutedRef.current` becomes `true`.
4. Once the mount effect successfully completes opening the initial window, it sets `hasRoutedRef.current = true`, enabling active bidirectional URL sync.

---

## 2. Build-Time Static SEO Pre-rendering

To ensure that search engine crawlers and social media preview bots (Telegram, VK, Twitter, Facebook) see the correct page title, meta description, and canonical tags for every deep link without needing to execute JavaScript, the build system performs **Static Site Generation (SSG)** on metadata during the build.

### Vite Post-Build Plugin

Inside [vite.config.mjs](file:///h:/portfolio-2025/vite.config.mjs), a custom build plugin `generate-seo-files` executes during `closeBundle()`:

1. It reads the base compiled `dist/index.html`.
2. For each route defined in `ROUTE_METADATA` (e.g. `about`, `projects`, `icon-painter`):
   - It replaces the base HTML head tags (title, description, canonical link, Open Graph tags, Twitter card tags, JSON-LD schema URL) with page-specific metadata.
   - For subpages, it creates a folder under `dist/[route]/` and writes the customized `index.html` inside it (making `/projects/index.html` available to Vercel/crawlers).
   - For the root route (`""`), it overwrites the main `dist/index.html` with root metadata.
3. It automatically updates the generated `dist/sitemap.xml` listing all active routes, and updates `dist/robots.txt` pointing to the sitemap.

---

## 3. Maintenance: Adding a New Route

When you add a new app, folder, or file that should be accessible via a direct URL link (e.g., adding a new game `/tetris` or folder `/gallery`), you **must** update the configuration in three places:

### Step 1: Add to `vite.config.mjs`

Open [vite.config.mjs](file:///h:/portfolio-2025/vite.config.mjs) and append the new route key and its metadata into the `ROUTE_METADATA` object inside the `closeBundle` hook:

```javascript
"my-new-app": {
  title: "My New App — ib1zza",
  description: "A description of my new app that will be indexed by search engines and displayed on social cards.",
  ogTitle: "My New App — Mikhail (ib1zza)",
}
```

_Note: This automatically adds the route to `sitemap.xml` and generates `dist/my-new-app/index.html` with the specified metadata during compilation._

### Step 2: Add to `routing.ts`

Open [routing.ts](file:///h:/portfolio-2025/src/utils/routing.ts) and add the mapping between the URL slug and your file system item ID to both dictionaries:

```typescript
const PATH_TO_ITEM_ID: Record<string, string> = {
  // ...
  "my-new-app": "myNewAppId",
};

const ITEM_ID_TO_PATH: Record<string, string> = {
  // ...
  myNewAppId: "my-new-app",
};
```

---

## 4. Verification

To verify that routing and SEO pre-rendering compile correctly:

1. Run `yarn build` to build the site.
2. Check that the `dist/` directory contains:
   - Dynamic directories for all routes (e.g., `dist/projects/index.html`, `dist/about/index.html`, etc.) containing customized meta descriptions.
   - `dist/sitemap.xml` listing all paths.
