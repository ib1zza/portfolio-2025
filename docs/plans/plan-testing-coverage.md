# Testing Coverage Plan (Goal: 90%)

[← Back to README](./README.md)

This document outlines a step-by-step strategy to progressively achieve 90% test coverage across the project. We start with fundamental, rarely changing components (bottom-up approach) and progressively move to more complex modules.

## Phase 1: Foundations (Utilities & UI Kit) - 10-20% coverage
These files have the least dependencies and change infrequently.
- [x] **Utilities (`src/utils`)**:
  - `uiScale.ts`, `assets.ts`, `cursors.ts`, `storage.ts`
- [ ] **UI Kit (`src/components/UIKit`)**:
  - `MacButton`, `MacTextInput`, `MacSlider`, `MacProgress`, `MacPromptDialog`, `PopupSelect`
- [ ] **Constants (`src/constants`)**:
  - `responsive.ts`, etc.

## Phase 2: Independent Hooks and Types - 20-35% coverage
Testing standalone hooks that do not rely heavily on UI state.
- [ ] **Hooks (`src/hooks`)**:
  - `useScale.ts`, `useHaptics.ts`, `useCustomCursor.ts`
- [ ] **State Management (Stores) (`src/store`)**:
  - `useWindowManager.ts`, `useFileSystem.ts`

## Phase 3: Presentational Components - 35-60% coverage
Testing pure UI components that accept props and render without much side-effects.
- [ ] **Basic Components (`src/components`)**:
  - `Loader`, `IconPainter`, `Topbar`, `SimpleVideoPlayer`, `VideoPlayer`
- [ ] **Windows Components (`src/components/Window`)**:
  - `Window`, `WindowOpenAnimation`

## Phase 4: Feature-heavy Components & Integration - 60-80% coverage
Testing complex components that stitch together UI Kit components, hooks, and stores.
- [ ] **Feature Components (`src/features`)**:
  - `easter-eggs` modules (HyperCardStack, SystemCrashOverlay)
- [ ] **App Components (`src/components/*`)**:
  - `Desktop`, `PortfolioAssistant`, `SpaceInvaders`, `DitherStudio`, `ModelViewerApp`

## Phase 5: App Core and Edge Cases - 80-90% coverage
Closing the gap by finding edge cases, testing app routing (if any) and top-level providers.
- [ ] **App core (`src/App.tsx`, `src/contexts`)**
- [ ] Refactoring missing uncovered branches in Vitest HTML reports.
- [ ] Running regular `npm run coverage` during PRs.

## Execution
For each component in Phase 1-2, we should:
1. Write a `.test.tsx` / `.test.ts` file covering core functionality and edge cases.
2. (For UI) Write a `.stories.tsx` file for Storybook visualization.
3. Validate coverage with `npm run coverage`.
