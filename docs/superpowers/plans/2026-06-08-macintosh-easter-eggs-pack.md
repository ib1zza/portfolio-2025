# Macintosh Easter Eggs Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four hidden Macintosh-style easter eggs that feel like native system artifacts rather than game UI.

**Architecture:** Keep all trigger detection and session state in a dedicated easter-egg runtime layer mounted inside the desktop shell. Reuse the existing window manager, file system, menu system, and document renderer; extend them only where the hidden artifacts need custom window chrome, fixed sizing, or special document layout.

**Tech Stack:** React 19, TypeScript, Zustand, Framer Motion, existing Mac-style UI components.

---

### Task 1: Extend the desktop model for hidden artifacts

**Files:**
- Modify: `src/store/useFileSystem.ts`
- Modify: `src/store/useWindowManager.ts`
- Modify: `src/constants/windowLayout.ts`
- Modify: `src/components/Folder/FinderIcon.tsx`
- Modify: `src/components/Folder/Folder.tsx`
- Modify: `src/components/Window/WindowFolderContent.tsx`

- [ ] **Step 1: Add hidden disk/app/file metadata and window flags**
- [ ] **Step 2: Update desktop rendering paths so system disks and special files behave like native Finder items**
- [ ] **Step 3: Run `npm run build` and fix any type or layout regressions**

### Task 2: Add the easter-egg runtime and trigger handling

**Files:**
- Create: `src/features/easter-eggs/*`
- Modify: `src/components/Desktop/Desktop.tsx`
- Modify: `src/components/Topbar/Topbar.tsx`

- [ ] **Step 1: Add keyboard, Shift-menu, and Option-click trigger detection**
- [ ] **Step 2: Wire runtime actions for HyperCard, Time Machine HD, and hidden file reveal state**
- [ ] **Step 3: Run `npm run build` and verify the desktop still mounts cleanly**

### Task 3: Build the hidden windows and dialogs

**Files:**
- Create: `src/features/easter-eggs/components/*`
- Modify: `src/components/Window/Window.tsx`
- Modify: `src/components/Window/WindowAppContent.tsx`
- Modify: `src/components/Window/WindowDocumentContent.tsx`
- Modify: `src/components/Window/WindowTitleBar.tsx`
- Modify: `src/components/Window/Window.module.scss`

- [ ] **Step 1: Implement the HyperCard stack window with card navigation and a tiny open beep**
- [ ] **Step 2: Implement the Special-menu dialogs, including confirmation and progress variants**
- [ ] **Step 3: Add the LAST_DISK note layout and fixed-window chrome**

### Task 4: Add the retro screenshot asset and final verification

**Files:**
- Create: `public/easter-eggs/screenshot_1988.png`

- [ ] **Step 1: Generate the monochrome Macintosh desktop screenshot asset**
- [ ] **Step 2: Run `npm run lint` and `npm run build`**
- [ ] **Step 3: Manually verify the desktop flow in the browser**

