# UI System

[← Back to README](./README.md)

This project heavily relies on a cohesive set of visual and interaction rules to emulate a classic Macintosh environment.

## Desktop Metaphor

The application is treated not as a standard webpage, but as a bounded 2D desktop. Elements sit absolutely positioned within this space.

- **Desktop:** The root container that catches unhandled clicks and serves as the canvas.
- **Topbar:** A fixed menu bar at the top of the screen. Its menus are dynamic and context-sensitive depending on the active window.
- **Windows:** Draggable, resizable containers that hold application content or document views.

## Window System & Z-Index

The window system is managed visually by the `Window` component (`src/components/Window/`).
- **Drag & Resize:** Operations are intercepted and passed to `useWindowManager` to persist state.
- **Z-Index Rules:** Because overlapping windows are a core feature, `src/constants/zIndex.ts` defines a strict hierarchy. The focused window is dynamically assigned the highest z-index among standard windows. The Topbar, custom cursors, and system dialogs must always sit above *all* standard windows.
- **Animations:** Framer Motion is used for smooth "morphing" animations when opening or minimizing windows, providing a modern touch to the retro UI. Timing is configured in `src/constants/windowAnimation.ts`.

## UI Scaling System

To ensure the classic pixel-art aesthetic feels appropriate on both 4k monitors and mobile devices, the app utilizes a global scaling system.
- A CSS custom property, `--ui-scale`, is applied dynamically at runtime.
- The default is usually `1x` for standard desktop monitors, but it may scale up (e.g., `1.5x` or `2x`) for high-DPI displays or specific accessibility settings.
- **TypeScript Integration:** In cases where absolute positions need to be calculated in JavaScript (like window dragging bounds), helper functions like `scaleUiValue` (from `src/utils/uiScale.ts`) must be used to translate physical pixels into scaled layout units.

## Custom Cursors

The project replaces the standard browser cursor to complete the immersive OS experience.
- Handled by `src/components/CustomCursor/` and `src/utils/cursors.ts`.
- The cursor is an absolutely positioned element that follows pointer coordinates.
- It dynamically switches graphics (e.g., standard pointer, text I-beam, wait watch, or custom app tools) based on context and hover states.

## Safely Modifying the UI

When making UI changes, adhere to the following rules:
1. **Respect the grid and borders:** Classic Mac UI uses stark 1px solid black borders and defined patterns. Avoid soft box-shadows, border-radius (unless specific to a replicated Mac element), and anti-aliased gradients.
2. **Use scale helpers:** Never hardcode pixel values in JavaScript calculation if they relate to layout positions; always pass them through the scaling utility.
3. **Verify animations:** If you modify window Chrome or Topbar mechanics, ensure the Framer Motion layout animations do not break or snap unexpectedly.
