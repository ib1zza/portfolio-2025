# Maintenance Workflows

[← Back to README](./README.md)

This document outlines common maintenance workflows for keeping the project healthy over time.

## Dependency Updates

When updating dependencies (especially React, Zustand, Three.js, or Framer Motion):

1. **Review Breaking Changes:** Check the changelogs of major libraries.
2. **Run Tests/Lint:** Ensure `yarn lint` passes without errors.
3. **Verify 3D Contexts:** Updates to `@react-three/fiber` or `three` frequently cause subtle breakage in model loading or lighting. Always manually test the `ModelViewerApp` after an update.
4. **Peer Dependencies:** If you encounter peer dependency conflicts during `yarn install` (e.g., related to Storybook or Vite plugins), prefer resolving the underlying version conflict instead of adding install workarounds.

## Documentation Updates

Documentation is only useful if it is accurate.

- **When adding features:** Ensure `docs/apps.md`, `docs/runtime-flow.md`, or `docs/state-management.md` are updated to reflect new systems.
- **Validation:** Always verify that relative links within the `docs/` folder still work after moving or renaming files.

## Performance and Bundle-Size Review

The project uses aggressive manual chunking in Vite to keep initial load times fast, despite heavy dependencies like Three.js.

1. **Analyze Bundle:** You can use tools like `rollup-plugin-visualizer` (if installed) to generate a bundle map.
2. **Lazy Loading:** Ensure new built-in apps or large visual components (like custom cursors) are wrapped in `React.lazy()` so they don't bloat the main desktop entry chunk.
3. **3D Asset Size:** Keep `.glb` models compressed. Large models should ideally use Draco compression.
4. **Execution Bottlenecks:** Be mindful of instantiating expensive objects inside loops or frequent intervals. For example, always cache `Intl.DateTimeFormat` instances outside of React components or `setInterval` calls, as creating them on every tick causes significant CPU overhead.
5. **Array Lookups:** To optimize nested array lookups, replace `.includes()` or `.some()` inside `.reduce()` or `.filter()` methods with `.has()` lookups on `Set`s or `Map`s to change O(N*M) complexity to O(1).
6. **DOM Queries:** Avoid repeated DOM queries (e.g., `document.querySelector`) inside loops or global event handlers (like pointer events). Instead, fetch elements in a single batch using `document.querySelectorAll` and cache them in a `Map`, or traverse the DOM directly via properties like `.firstElementChild` to prevent performance bottlenecks.

## Dead Code and Asset Cleanup

Over time, icons or models may become unused.

- **Asset Cleanup:** Before deleting an image from `public/`, perform a global text search across the repository. Remember that assets are often referenced by string paths in Zustand stores, not by static imports.
- **Dead Code Cleanup:** Trust the TypeScript compiler. If a component is no longer exported or used, remove it to reduce clutter.

## Accessibility Review

While a retro desktop simulator inherently struggles with standard web accessibility paradigms, best efforts should be made:

- Ensure topbar menus can be navigated or have logical DOM structures.
- Use `alt` text on static images where appropriate.
- Ensure the custom scaling logic (`--ui-scale`) respects browser zoom levels where possible without breaking the fixed layout constraints.
