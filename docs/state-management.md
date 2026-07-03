# State Management

[← Back to README](./README.md)

This project uses [Zustand](https://github.com/pmndrs/zustand) for global state management. Zustand was chosen for its minimal boilerplate and ease of integrating state across both React DOM and React Three Fiber environments.

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

## Persistence and `localStorage`

Both core stores utilize Zustand's `persist` middleware to save state to the browser's `localStorage`.

- **Throttling:** Writing to `localStorage` on every pixel of a window drag operation is highly inefficient. Therefore, operations that update layout or positions use throttled storage wrappers or debounced actions to save state without degrading 60fps rendering performance.
- **Versioning:** State definitions include versioning. If the structure of `useFileSystem` or `useWindowManager` drastically changes during development, the application logic must handle discarding or migrating outdated `localStorage` data to prevent runtime crashes.

## Where State Belongs

- **Global OS State:** Use `useFileSystem` or `useWindowManager`.
- **Application Specific Global State:** If an app (like Icon Painter) needs state shared across deeply nested components within that app *but nowhere else*, consider creating a scoped Zustand store or using React Context for that specific app tree.
- **Local Component State:** Standard UI toggles (dropdowns open/close, hover states) should remain standard `useState` within the relevant component.
