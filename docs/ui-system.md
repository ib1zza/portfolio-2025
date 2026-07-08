# UI System

[← Back to README](./README.md)

This project heavily relies on a cohesive set of visual and interaction rules to emulate a classic Macintosh environment.

---

## Desktop Metaphor

The application is treated not as a standard webpage, but as a bounded 2D desktop. Elements sit absolutely positioned within this space.

- **Desktop:** The root container that catches unhandled clicks, serves as the canvas, and supports optimized spatial keyboard navigation (arrow keys). Spatial navigation is automatically disabled when a window is focused.
- **Topbar:** A fixed menu bar at the top of the screen. Its menus are dynamic and context-sensitive depending on the active window.
- **Windows:** Draggable, resizable containers that hold application content or document views.

---

## Window System & Z-Index

The window system is managed visually by the `Window` component (`src/components/Window/`).

- **Drag & Resize:** Operations are intercepted and passed to `useWindowManager` to persist state.
- **Z-Index Rules:** Because overlapping windows are a core feature, `src/constants/zIndex.ts` defines a strict hierarchy. The focused window is dynamically assigned the highest z-index among standard windows. The Topbar, custom cursors, and system dialogs must always sit above _all_ standard windows.
- **Animations:** Framer Motion is used for smooth "morphing" animations when opening or minimizing windows, providing a modern touch to the retro UI. Timing is configured in `src/constants/windowAnimation.ts`.

---

## UI Scaling & Style Tokens

The UI is scaled through CSS custom properties, not `transform: scale(...)`. This keeps drag/drop, hitboxes, scrollbars, canvas tools, and R3F (React Three Fiber) scenes aligned with the actual DOM geometry.

### Scale Presets

`src/global/styles/index.scss` owns the runtime scale:

- Mobile and coarse pointers: `--ui-scale: 1`
- Tablet-sized fine pointers (769px - 1023px): `--ui-scale: 1.5`
- Desktop fine pointers (1024px+): `--ui-scale: 2`

TypeScript mirrors the exact same presets in `src/utils/uiScale.ts`.

### SCSS Helpers

`src/global/styles/_vars.scss` exposes:

- `$white`, `$black`, `$border`
- z-index constants
- `ui($value)`, which returns `calc(<value> * var(--ui-scale))`

Use `ui(...)` for System UI dimensions that should scale with the interface.
Keep physical `1px` values for crisp borders, pixel patterns, scanlines, and hand-authored icon geometry.

### Token Groups

The main CSS variables in `src/global/styles/index.scss` are grouped by purpose:

- **Shell Metrics:** Topbar, window titlebar, finder data row, scrollbars
- **Finder Icons:** Icon size, label font size, label line height
- **Controls:** Buttons, default buttons, inputs, popup select, progress
- **App Layout:** App padding, panel padding, gaps, canvas sizes
- **App Presets:** Icon Painter, Dither Studio, Badge Generator, Model Viewer
- **Standalone Route Metrics:** Badge page, dialog, QR
- Document/project preview metrics
- Loader and desktop mobile layout metrics

### Window Presets

Window geometry lives in `src/constants/windowLayout.ts`.
Use `scaleUiValue(...)` and `scaleUiSize(...)` there for any new default window position, size, min size, fit size, or animation geometry. Mobile fullscreen window bounds intentionally stay unscaled and use dedicated mobile metrics.

---

## Custom Cursors

The project replaces the standard browser cursor to complete the immersive OS experience.

- Handled by `src/components/CustomCursor/` and `src/utils/cursors.ts`.
- The cursor is an absolutely positioned element that follows pointer coordinates.
- It dynamically switches graphics (e.g., standard pointer, text I-beam, wait watch, or custom app tools) based on context and hover states.
- On touch/coarse devices: `body.style.cursor = "default"`; on fine-pointer: `body.style.cursor = "none"`.
- The `/badge` route always uses the native cursor.

---

## Safely Modifying the UI

When making UI changes, adhere to the following rules:

1. **Respect the grid and borders:** Classic Mac UI uses stark 1px solid black borders and defined patterns. Avoid soft box-shadows, border-radius (unless specific to a replicated Mac element), and anti-aliased gradients. Keep true bitmap/grid/caret/path coordinates unscaled when changing them would soften or distort the 1-bit visual.
2. **Use scale helpers:** Never hardcode pixel values in JavaScript calculation if they relate to layout positions; always pass them through the scaling utility (`scaleUiValue` or `scaleUiSize`).
3. **Verify animations:** If you modify window Chrome or Topbar mechanics, ensure the Framer Motion layout animations do not break or snap unexpectedly.
4. **Define reusable dimensions:** Add reusable dimensions to `index.scss` if more than one component needs them. Use `ui(...)` in SCSS for one-off component dimensions that still need to scale.
