# Style Tokens

The UI is scaled through CSS custom properties, not `transform: scale(...)`.
This keeps drag/drop, hitboxes, scrollbars, canvas tools, and R3F scenes aligned
with the actual DOM geometry.

## Scale Presets

`src/global/styles/index.scss` owns the runtime scale:

- mobile and coarse pointers: `--ui-scale: 1`
- tablet-sized fine pointers: `--ui-scale: 1.5`
- desktop fine pointers from `1024px`: `--ui-scale: 2`

TypeScript mirrors the same presets in `src/utils/uiScale.ts`.

## SCSS Helpers

`src/global/styles/_vars.scss` exposes:

- `$white`, `$black`, `$border`
- z-index constants
- `ui($value)`, which returns `calc(<value> * var(--ui-scale))`

Use `ui(...)` for System UI dimensions that should scale with the interface.
Keep physical `1px` values for crisp borders, pixel patterns, scanlines, and
hand-authored icon geometry.

## Token Groups

The main CSS variables in `src/global/styles/index.scss` are grouped by purpose:

- shell metrics: topbar, window titlebar, finder data row, scrollbars
- finder icons: icon size, label font size, label line height
- controls: buttons, default buttons, inputs, popup select, progress
- app layout: app padding, panel padding, gaps, canvas sizes
- app presets: Icon Painter, Dither Studio, Badge Generator, Model Viewer
- standalone route metrics: badge page, dialog, QR
- document/project preview metrics
- loader and desktop mobile layout metrics

## Window Presets

Window geometry lives in `src/constants/windowLayout.ts`.

Use `scaleUiValue(...)` and `scaleUiSize(...)` there for any new default window
position, size, min size, fit size, or animation geometry. Mobile fullscreen
window bounds intentionally stay unscaled and use dedicated mobile metrics.

## When Adding UI

1. Add reusable dimensions to `index.scss` if more than one component needs them.
2. Use `ui(...)` for one-off component dimensions that still need to scale.
3. Keep true bitmap/grid/caret/path coordinates unscaled when changing them would
   soften or distort the 1-bit visual.
4. Mirror any runtime layout metric in TypeScript only when DOM behavior needs it.
