# Agent Guide

[← Back to README](./README.md)

This guide is specifically written for AI coding agents working within this repository. It provides practical rules to ensure safe modifications without breaking the application's unique architecture or aesthetic.

## Where to Start Reading

If you are assigned a new task, do not try to read the entire codebase. Start here:
1. **The Task Description:** Understand what is being asked.
2. **`docs/file-map.md`:** Find out which directory likely contains the code you need to touch.
3. **`docs/architecture.md` & `docs/state-management.md`:** Understand how data flows between stores and the UI.
4. **`AGENTS.md` (Root):** Check the repository root for any overriding, context-specific agent instructions.

## Choosing the Right Files

- **Adding a new desktop icon?** Modify the initial state in `src/store/useFileSystem.ts`.
- **Modifying window drag/drop?** Look in `src/components/Window/` and `src/store/useWindowManager.ts`.
- **Adding a new app?** Create it in `src/components/`, export it, and then register it as an openable app within the Window rendering logic and file system.
- **Fixing a visual bug?** Check if it's related to scaling (`src/utils/uiScale.ts`), z-index (`src/constants/zIndex.ts`), or specific component SCSS.

## Safe Edit Rules

1. **Do not invent abstractions.** If you need a utility, check `src/utils/` first. If you need a UI component, check `src/components/UIKit/` or similar directories before building from scratch.
2. **Use existing constants.** Do not hardcode z-indexes, animation durations, or breakpoints. Use the files in `src/constants/`.
3. **Handle `localStorage` safely.** The app persists state heavily. If you change the shape of an interface in `useFileSystem` or `useWindowManager`, existing users will have old data in their browsers. You *must* consider how to handle versioning or provide fallback defaults so the app does not crash on load.

## Avoiding Visual Style Breakage

This app perfectly replicates a specific retro aesthetic (Macintosh System 6/7).
- **Strictly adhere to the monochrome/dithered look.** Do not add soft shadows, gradients, or non-system fonts unless specifically requested.
- **Borders are 1px solid black.**
- **UI Scaling:** All UI dimensions that interact with JavaScript layout calculations must go through the scale helpers. Do not assume `1px` on screen equals `1px` in logic.

## How to Verify Changes

1. **Run the Linter:** Always run `npm run lint` before submitting.
2. **Check the Dev Server:** Start `npm run dev` and visually verify the changes. If you changed window logic, try dragging, resizing, minimizing, and maximizing.
3. **Check Persisted State:** Refresh the browser. Did the window stay where you left it? Did the app crash because of malformed state? If so, fix the persistence logic.
