# Testing Coverage Plan (Goal: 90%)

> **Current coverage: 54.82%** (54 test files, 392 tests) — Phase 5 in progress

[← Back to README](./README.md)

This document outlines a step-by-step strategy to progressively achieve 90% test coverage across the project. We start with fundamental, rarely changing components (bottom-up approach) and progressively move to more complex modules.

## Phase 1: Foundations (Utilities & UI Kit) — 10-20% coverage

- [x] **Utilities (`src/utils`)**:
  - `uiScale.ts`, `assets.ts`, `cursors.ts`, `storage.ts`
- [x] **UI Kit (`src/components/UIKit`)**:
  - `MacButton`, `MacTextInput`, `MacSlider`, `MacProgress`, `MacPromptDialog`, `PopupSelect`
- [x] **Constants (`src/constants`)**:
  - `responsive.ts`, `zIndex.ts`, `windowLayout.ts`, `windowAnimation.ts`

## Phase 2: Independent Hooks and Types — 20-35% coverage

- [x] **Hooks (`src/hooks`)**:
  - `useScale.ts`, `useHaptics.ts`, `useCustomCursor.ts`
- [x] **State Management (Stores) (`src/store`)**:
  - `useWindowManager.ts`, `useFileSystem.ts`

## Phase 3: Presentational Components — 35-60% coverage

- [x] **Basic Components (`src/components`)**:
  - `Loader` (92.3% stmts), `IconPainter` (56.7%), `Topbar` (52.8%), `SimpleVideoPlayer` (53.7%), `VideoPlayer` (50.4%)
- [x] **Windows Components (`src/components/Window`)**:
  - `Window` (74% stmts), `WindowOpenAnimation` (90.3%), `WindowTitleBar` (76.9%), `WindowContainer` (85.7%), `WindowFinderData` (78.9%), `windowGeometry` (100%)

## Phase 4: Feature-heavy Components & Integration — 60-80% coverage

- [x] **Feature Components (`src/features`)**:
  - `HyperCardStack` (83.6% stmts), `SystemCrashOverlay` (80.6%)
- [x] **App Components (`src/components/*`)**:
  - `Desktop` (36.4%), `PortfolioAssistant` (80.4%), `SpaceInvaders` (22.9%), `DitherStudio` (50.2%), `ModelViewerApp` (71.6%)

## Phase 5: App Core and Edge Cases — 80-90% coverage

- [x] **App root & contexts**: `App.tsx` (88.7%), `CursorContext` (92.1%)
- [x] **Easter egg data**: `easterEggDefinitions` (100%), `useEasterEggProgress` (53.8%), `EasterEggContext` (100%)
- [x] **EasterEggProvider** (358 строк): 0% → 82.3% (10 тестов)
- [x] **BadgeGenerator** (437 строк): 0% → 73.0% (11 тестов)
- [x] **AudioPlayer** (462 строк): 0% → 38.6% (7 тестов; canvas/getContext не поддерживается в jsdom)
- [x] **FinderIcon** (431 строк): 1.6% → ~95% (20 тестов)
- [x] **FinderItem** (55 строк): 6.7% → ~95% (4 теста)
- [x] **Folder** (336 строк): 1.5% → 41.3% (4 теста)
- [x] **WindowAppContent** (118 строк): 3.3% → 100% (11 тестов)
- [x] **WindowFolderContent** (125 строк): 10.3% → ~95% (6 тестов)
- [x] **WindowScrollbars** (154 строк): 64.2% → ~90% (6 тестов)
- [x] **EasterEggLogDocument** (48 строк): 3.4% → ~95% (3 теста)
- [x] **SpecialActionDialogHost** (142 строк): 0% → ~90% (8 тестов)
- [ ] **Оставшиеся пробелы**:
      | Файл | stmts | Строк |
      |------|-------|-------|
      | `ProjectModelViewer.tsx` | 17.5% | ~400 |
      | `ImageViewer.tsx` | 0% | ~90 |
      | `SpaceInvaders.tsx` | 22.9% | ~760 |
      | `Desktop.tsx` | 36.4% | ~320 |
      | `WindowDragLayer.tsx` | 60.2% | ~120 |
      | `WindowResizeLayer.tsx` | 50.5% | ~150 |
      | `fitToContent.ts` | 22.8% | ~180 |

- [ ] Running regular `yarn coverage` during PRs.

## Execution

1. Write a `.test.tsx` / `.test.ts` file covering core functionality and edge cases.
2. Validate coverage with `yarn coverage`.
3. Focus on high-impact low-coverage files first (red priority).
