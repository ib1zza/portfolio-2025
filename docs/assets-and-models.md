# Assets and Models

[← Back to README](./README.md)

This document explains how static assets are organized, stored, and loaded in the application.

## `public/` Directory Overview

All assets that are not directly imported into JavaScript via Vite's module system live in the `public/` directory. These files are served at the root of the site.

### Key Subdirectories

- **`icons/`**: Standard SVG or PNG icons used across the UI, particularly those that map to `useFileSystem` items.
- **`cursors/`**: Graphics used by the custom cursor system. Usually SVG files for crisp scaling.
- **`fonts/`**: Web fonts, specifically pixel fonts needed to replicate the classic Mac aesthetic (e.g., Chicago or similar replicas).
- **`models/`**: `.glb` (GLTF binary) files used by the 3D viewers.
- **`projects/`**: Images or media used to preview portfolio projects.
- **`media/`**, **`easter-eggs/`**: Other assorted media.

## Asset Resolution Conventions

Because the application can be deployed to different environments (like a custom domain via Vercel or a subpath via GitHub Pages), relying on absolute `/` paths in code is dangerous.

### Using `assets.ts`

The project provides utility functions in `src/utils/assets.ts` to resolve asset paths correctly.

- **Rule:** If you need to dynamically reference a file in the `public` directory (e.g., passing a URL to a `<video>` tag or a Three.js loader), you must use the helper functions from `assets.ts`.
- **Exception:** Files imported directly in CSS/SCSS or via Vite's standard `import logo from './logo.svg'` syntax are handled automatically by the bundler.

## Managing 3D Models

Models in `public/models/` should be optimized for the web.
- Prefer `.glb` formats as they bundle textures and geometry efficiently.
- Be aware of file sizes. A massive unoptimized model will severely impact the initial load time of the `ModelViewerApp`.

## Deletion Risks

**Warning:** Do not casually delete assets in `public/` without verifying they are unused. Many assets (like specific icons or models) are referenced by string paths in Zustand initial states (`useFileSystem.ts`) or API responses, rather than direct static imports. Deleting them will result in broken images or failed 3D model loads at runtime, which standard TypeScript linting will not catch.
