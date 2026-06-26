
# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Common Development Tasks

- **Install Dependencies**: `npm install`
- **Start Development Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Build for GitHub Pages**: `npm run build:github`
- **Run Linter**: `npm run lint`
- **Fix Linting Issues**: `npm run lint:fix`
- **Preview Production Build Locally**: `npm run preview`

## High-Level Code Architecture

This project is a modern React 19 application built with Vite 7 and TypeScript 5.9, designed as an interactive 3D portfolio that mimics a classic Macintosh (System 6/7) desktop environment. Key architectural aspects include:

- **Desktop Metaphor**: The UI simulates a virtual desktop with Finder-style icons, movable/resizable windows, a Topbar menu, and custom pixel-art cursors.
- **Component-Based UI**: `src/components` houses the UI, including main areas like `Desktop`, `Topbar`, and a robust `Window` system, along with several built-in applications (`IconPainter`, `DitherStudio`, `ModelViewerApp`, `BadgeGenerator`).
- **State Management**: Zustand 5 (`src/store`) is central for global state, with `useFileSystem` managing the virtual desktop items and `useWindowManager` handling window lifecycles and states. Both use `persist` middleware with throttled `localStorage`.
- **3D Graphics**: `@react-three/fiber` and `three.js` are integrated for rendering 3D models, particularly in the `ModelViewerApp` and `ProjectModelViewer` components.
- **UI Scaling System**: A responsive scaling system uses CSS custom property `--ui-scale` (1x, 1.5x, 2x) and corresponding TS helpers (`scaleUiValue`) to adapt UI dimensions based on viewport and pointer type.
- **Custom Cursor System**: `CursorProvider` and related hooks (`useCustomCursor`) manage a dynamic, SVG-based custom cursor, switching based on device and interaction context.
- **Window Animations**: Sophisticated `framer-motion` based animations handle window opening/closing morph effects, as well as proxied drag and resize operations.
- **Lazy Loading**: Key components like `Desktop`, `CustomCursor`, and individual applications are lazy-loaded to optimize initial bundle size and performance.
- **Deployment**: The application is deployed as a Single Page Application (SPA) on Vercel, with rewrites to `index.html` and optimized caching strategies.

## Key Directories

- `src/components/`: Reusable UI components and built-in applications.
- `src/store/`: Zustand stores for application-wide state management.
- `src/constants/`: Application constants, including UI layout, animation durations, and z-indices.
- `src/utils/`: Utility functions for asset resolution, versioned local storage, and UI scaling.
- `public/`: Static assets including fonts, SVG icons, 3D models (GLB), and project preview images.

## Built-in Applications

- **Icon Painter**: A 32x32 pixel icon editor with tools, undo history, and export/save capabilities.
- **Dither Studio**: An image dithering tool with various algorithms and export options.
- **Model Viewer**: A 3D model browser leveraging React Three Fiber.
- **Badge Generator**: A digital business card creator with QR code generation and shareable URLs.

## Deployment & Build

- **Vite Configuration**: `vite.config.mjs` handles aliases, SCSS preprocessor, asset paths (including GitHub Pages specific base path), and aggressive manual chunk splitting.
- **Vercel Configuration**: `vercel.json` defines SPA rewrites and efficient caching for static assets.

