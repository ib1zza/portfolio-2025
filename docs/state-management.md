# State Management

[← Back to README](./README.md)

This project uses [Zustand](https://github.com/pmndrs/zustand) for global state management. Zustand was chosen for its minimal boilerplate and ease of integrating state across both React DOM and React Three Fiber environments.

---

## Core Stores

There are two primary stores that manage the "operating system" layer of the project:

### 1. `useFileSystem`
**Path:** `src/store/useFileSystem.ts`

This store acts as the virtual file system.
- **Responsibilities:** Keeps track of files, folders, and applications that exist on the user's desktop. It stores their metadata (names, icons, types) and their exact coordinates on the screen.
- **State Ownership:** It owns the definition of *what exists*. It does not care if something is currently open or rendering as a window; it only tracks that the item lives on the desktop.
- **Key Actions:** `updateItemPosition`, `addItem`, `removeItem`.

### 2. `useWindowManager`
**Path:** `src/store/useWindowManager.ts`

This store manages the window lifecycle and visual state.
- **Responsibilities:** Tracks which windows are open, their dimensions, positions, z-indexes, and minimized states. It also keeps track of the currently "active" or focused window.
- **State Ownership:** It owns the definition of *what is open*. It receives references to underlying items (from `useFileSystem`) but only manages their temporary runtime window representation.
- **Key Actions:** `openWindow`, `closeWindow`, `focusWindow`, `updateWindowLayout`, `minimizeWindow`.

---

## Key TypeScript Types

These shapes represent the underlying structures utilized inside the stores and UI components:

### `FileSystemItem` (Unified Virtual File System Node)
Located in `src/types/fileSystem.ts`.
```typescript
type FileSystemItem = FolderItem | FileItem | LinkItem | AppItem

interface BaseItem {
  id: string
  name: string
  type: "folder" | "file" | "link" | "app" | "system"
  parentId?: string
  position?: { x: number; y: number }
  active?: boolean
}

interface FolderItem extends BaseItem {
  type: "folder"
  children: string[] // List of child item IDs
}

interface FileItem extends BaseItem {
  type: "file"
  content: string | DocumentBlock[] // Raw text or structured rich documents
}

interface LinkItem extends BaseItem {
  type: "link"
  href: string
  icon: "vk" | "telegram" | "email" | "github"
}

interface AppItem extends BaseItem {
  type: "app"
  app: "icon-painter" | "dither-studio" | "model-viewer" | "badge-generator" | "space-invaders"
  savedIconId?: string
}
```

### `WindowInstance` (Active Window Layout State)
Located in `src/types/windowState.ts`.
```typescript
interface WindowInstance {
  id: string
  title: string
  parentId?: string
  openerWindowId?: string
  fileId?: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  isMinimized?: boolean
  isMaximized?: boolean
}
```

### `CursorType` (Custom Pointer Graphics)
Located in `src/types/cursor.ts`.
```typescript
type CursorType =
  | "arrow"
  | "background"
  | "beam"
  | "busy"
  | "grab"
  | "grab_02"
  | "hand"
  | "pencil"
  | "precision"
  | "resize"
  | "resize_02"
  | "watch"
```

---

## Persistence and `localStorage`

Both core stores utilize Zustand's `persist` middleware to save state to the browser's `localStorage`.

- **Throttling:** Writing to `localStorage` on every pixel of a window drag or resize operation is highly inefficient. Therefore, the stores are combined with a debounced local storage writer `createThrottledLocalStorage(250)` which batches writes and flushes them to disk after 250ms or right before the window unloads.
- **Versioning:** State definitions include versioning. If the structure of `useFileSystem` or `useWindowManager` drastically changes during development, version migrations must be incremented.

### Store Persistence Details

| Store | localStorage key | Version | Persisted data |
|-------|-----------------|---------|---------------|
| **`useWindowManager`** | `portfolio-2025-window-manager` | 2 | `windowHistory` (last coordinates + dimensions per window ID) |
| **`useFileSystem`** | `portfolio-2025-file-system` | 2 | `itemPositions` (custom coordinate positions of items on the grid) |
| **Icon Painter Canvas** | `portfolio-2025-icon-painter` | 1 | Currently active canvas drawing state |
| **Icon Desktop** | `portfolio-2025-icon-painter-desktop` | 1 | Saved desktop-facing custom canvas icon data |
| **Icon Library** | `portfolio-2025-icon-painter-library` | 1 | Completed icon collection |

---

## Where State Belongs

- **Global OS State:** Use `useFileSystem` or `useWindowManager`.
- **Application Specific Global State:** If an app (like Icon Painter) needs state shared across deeply nested components within that app *but nowhere else*, consider creating a scoped Zustand store or using React Context for that specific app tree.
- **Local Component State:** Standard UI toggles (dropdowns open/close, hover states) should remain standard `useState` within the relevant component.
