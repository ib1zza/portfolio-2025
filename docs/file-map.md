# File Map

[← Back to README](./README.md)

This document provides a map of the important directories and files in the repository. If you are an agent or a developer trying to find where to make a change, start here.

## Directory Structure

### `src/components/`
Contains all the React UI components, ranging from small structural pieces to complete built-in applications.
- **`Desktop/` & `Topbar/`:** The main layout shells.
- **`Window/`:** The generic window frame, handling dragging, resizing, and content injection.
- **`Folder/`:** Implementation of the desktop icons.
- **Built-in Apps:** Directories like `IconPainter`, `DitherStudio`, `ModelViewerApp`, etc.
- **`CustomCursor/`:** Implementation of the dynamic SVG cursors.

### `src/store/`
Contains the Zustand global state configurations.
- **`useFileSystem.ts`:** Manages the virtual files, folders, items on the desktop, and their positions.
- **`useWindowManager.ts`:** Manages open windows, z-index ordering, minimized states, and window dimensions.

### `src/constants/`
Defines the rules of the visual and structural system.
- **`windowLayout.ts`:** Sizing limits, snap grids, and default dimensions for windows.
- **`zIndex.ts`:** The global stacking order rules to ensure modals appear over topbars, and active windows appear over inactive ones.
- **`windowAnimation.ts`:** Timing configurations for Framer Motion.
- **`responsive.ts`:** Constants related to screen breakpoints.

### `src/utils/`
Helper functions that do not belong to a specific component.
- **`uiScale.ts`:** Logic for translating standard pixel values based on the current CSS `--ui-scale` variable.
- **`assets.ts`:** Resolution paths for dynamic public assets.
- **`storage.ts`:** Utilities for interacting safely with localStorage, including versioning and throttling.
- **`cursors.ts`:** Helper definitions for custom cursor logic.

### `public/`
Static assets served directly without being processed by Vite's bundler.
- **`icons/`, `cursors/`, `fonts/`:** Essential UI assets.
- **`models/`:** `.glb` files used by the Model Viewer and 3D scenes.
- **`projects/`:** Preview images for portfolio items.
- Root files like `favicon.ico`, `robots.txt`, and PWA icons.

## Configuration Files

- **`vite.config.mjs`:** Configures the build system, including path aliases, SCSS processing, and manual chunking for performance.
- **`vercel.json`:** Deployment rules for Vercel, handling SPA rewrites and asset caching.
- **`package.json`:** Defines dependencies and scripts (`dev`, `build`, `lint`, etc.).
- **`eslint.config.js`:** The linting rules for the project.
- **`tsconfig.*.json`:** TypeScript compiler configurations.

## Where to Look First

- **To change a global state behavior:** Start in `src/store/`.
- **To modify the appearance of the OS UI:** Check `src/components/Window/`, `src/components/Desktop/`, or `src/components/Topbar/`.
- **To add a new application:** Create a new directory under `src/components/`, then hook it up in `src/components/Window/` and register an item in `src/store/useFileSystem.ts`.
