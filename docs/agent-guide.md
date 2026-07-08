# Agent Guide

[← Back to README](./README.md)

This guide is specifically written for AI coding agents and developers working within this repository. It provides practical rules to ensure safe modifications without breaking the application's unique classic Macintosh (System 6/7) architecture or aesthetic.

---

## Common Development Tasks

- **Install Dependencies**: `yarn install`
- **Start Development Server**: `yarn dev`
- **Build for Production**: `yarn build`
- **Build for GitHub Pages**: `yarn build:github`
- **Run Linter**: `yarn lint`
- **Fix Linting Issues**: `yarn lint:fix`
- **Preview Production Build Locally**: `yarn preview`

---

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

---

## Where to Start Reading

If you are assigned a new task, start by consulting these documents in order:

1. **The Task Description**: Understand what is being asked.
2. [**File Map**](./file-map.md): Find out which directory likely contains the code you need to touch.
3. [**Architecture**](./architecture.md) & [**State Management**](./state-management.md): Understand how data flows between stores and the UI.
4. **This Guide**: Review the development tasks, safe edit rules, and aesthetic constraints.

---

## Choosing the Right Files

- **Adding a new desktop icon?** Modify the initial state in `src/store/useFileSystem.ts`.
- **Modifying window drag/drop?** Look in `src/components/Window/` and `src/store/useWindowManager.ts`.
- **Adding a new app?** Create it in `src/components/`, export it, and then register it as an openable app within the Window rendering logic and file system.
- **Fixing a visual bug?** Check if it's related to scaling (`src/utils/uiScale.ts`), z-index (`src/constants/zIndex.ts`), or specific component SCSS.

---

## Safe Edit Rules

1. **Do not invent abstractions.** If you need a utility, check `src/utils/` first. If you need a UI component, check `src/components/UIKit/` or similar directories before building from scratch.
2. **Use existing constants.** Do not hardcode z-indexes, animation durations, or breakpoints. Use the files in `src/constants/`.
3. **Handle `localStorage` safely.** The app persists state heavily. If you change the shape of an interface in `useFileSystem` or `useWindowManager`, existing users will have old data in their browsers. You _must_ consider how to handle versioning or provide fallback defaults so the app does not crash on load.

---

## Performance Guidelines

This project targets 60fps across the board and must run smoothly on lower-end devices despite rendering full window systems and 3D models. To ensure optimal performance:

1. **DOM Query Caching:** Avoid repeated DOM lookups (`document.querySelector`) inside loops (like `map` or `filter`). Always fetch elements in a single batch using `document.querySelectorAll` before the loop and cache them in a `Map` to enable O(1) lookups.
2. **Array Chain Reductions:** When manipulating small arrays inside critical execution paths (like calculating search scoring metrics), combine chained array operations (`.filter()`, `.sort()`, and `.map()`) into a single `.reduce()` pass using inline insertion sort techniques.
3. **Canvas Optimization:** When dealing with destructible elements or visual modifications in canvas apps (like Space Invaders), never rely on pixel-by-pixel `fillRect` redraws per frame. Instead, use an offscreen `HTMLCanvasElement` to draw the initial state, rendering it in a single `ctx.drawImage()`, and use `ctx.clearRect()` for localized damage tracking.

---

## Avoiding Visual Style Breakage

This app perfectly replicates a specific retro aesthetic (Macintosh System 6/7).

- **Strictly adhere to the monochrome/dithered look.** Do not add soft shadows, gradients, or non-system fonts unless specifically requested.
- **Borders are 1px solid black.**
- **UI Scaling:** All UI dimensions that interact with JavaScript layout calculations must go through the scale helpers. Do not assume `1px` on screen equals `1px` in logic. See [**UI System**](./ui-system.md) for style token guidelines.

---

## How to Verify Changes

1. **Run the Linter:** Always run `yarn lint` before submitting.
2. **Check the Dev Server:** Start `yarn dev` and visually verify the changes. If you changed window logic, try dragging, resizing, minimizing, and maximizing.
3. **Check Persisted State:** Refresh the browser. Did the window stay where you left it? Did the app crash because of malformed state? If so, fix the persistence logic.
