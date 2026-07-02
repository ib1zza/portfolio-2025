# Runtime Flow

[← Back to README](./README.md)

This document outlines the lifecycle of the application, from initial load to common user interactions.

## 1. Application Initialization

1. **Vite Entry Point:** The browser loads `index.html` and executes the compiled React entry script.
2. **State Hydration:** Zustand stores (`useFileSystem` and `useWindowManager`) initialize. If persistence is configured, they attempt to read their previous state from `localStorage` (e.g., restoring window positions or previously opened apps).
3. **Global Layout Mount:** The root App component mounts the `Desktop`, `Topbar`, and `CursorProvider`.

## 2. Desktop Render

1. **Scaling System:** The application determines the appropriate UI scale based on device properties and applies a CSS variable (`--ui-scale`).
2. **File System Mapping:** The `Desktop` component reads items from `useFileSystem`. It maps over these items and renders `FinderIcon` components at their saved positions.
3. **Window Rendering:** The `Desktop` also reads open window instances from `useWindowManager` and renders `Window` components over the background.

## 3. Window Lifecycle & Interaction

### Opening an App or Window
1. A user double-clicks an icon (e.g., "Icon Painter").
2. The `FinderIcon` component dispatches an action to `useWindowManager` (e.g., `openWindow(appId)`).
3. `useWindowManager` creates a new `WindowInstance` object in its state arrays, managing its initial z-index to bring it to the front.
4. React reacts to the state change, rendering a new `Window` component.
5. Framer Motion animates the window opening (morphing from the icon position to its default window layout).

### Interacting with a Window
1. **Focus:** Clicking anywhere on an inactive window triggers a `focusWindow` action, updating the `useWindowManager` state to adjust z-indices and updating the `Topbar` to reflect the active app's context.
2. **Dragging:** Dragging the window title bar captures mouse movement. The updated position is passed back to `useWindowManager` to persist the window's layout.
3. **Closing:** Clicking the close button dispatches a `closeWindow` action. Framer Motion plays a closing animation, and once complete, the window is removed from the `useWindowManager` state.

## 4. Custom Cursor Execution

Throughout the runtime, the `CustomCursor` component listens to pointer events globally. It overrides the default browser cursor and draws a custom SVG graphic at the pointer coordinates. The cursor's visual state (e.g., default pointer, text beam, drag handle) changes dynamically based on the elements the user hovers over, communicating context heavily inspired by classic OS interfaces.
