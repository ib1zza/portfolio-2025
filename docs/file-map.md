# File Map

[← Back to README](./README.md)

This document provides a map of the important directories and files in the repository. If you are an agent or a developer trying to find where to make a change, start here.

---

## Complete Directory Layout

```
/
├── index.html                  # Entry HTML; preloads fonts, apple-touch-icon
├── package.json                # Dependencies, scripts
├── vite.config.mjs             # Vite config: aliases, SCSS preprocessor, chunk splitting
├── tsconfig.json               # Root TS config (references app + node)
├── tsconfig.app.json           # App TS config (src/)
├── tsconfig.node.json          # Node TS config (config files)
├── eslint.config.js            # ESLint flat config
├── vercel.json                 # Vercel SPA rewrites + cache headers
├── Makefile                    # `make dev` -> yarn dev
├── README.md                   # Project README (entry documentation pointer)
│
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   ├── apple-touch-icon-*.png          # Light/dark variants
│   ├── logo192.png / logo512.png
│   ├── pwa-icon-192.png / pwa-icon-512.png
│   ├── robots.txt
│   ├── cursors/                        # 12 SVG cursor states
│   ├── fonts/
│   │   ├── ChiKareGo2.{ttf,woff2}      # Pixel font (Chicago-style)
│   │   └── FindersKeepers.{ttf,woff2}  # Finder label font (Geneva-style)
│   ├── icons/
│   │   ├── arrow.svg, sparkle.svg, logo_mac.svg, happy_mac.svg, sad_mac.svg
│   │   ├── icon-painter.svg, dither-studio.svg, model-viewer.svg
│   ├── models/
│   │   ├── cap.glb, t-shirt.glb, silkworm.glb, simplex.glb
│   │   ├── printer-scanner.glb, open-wardrobe-closet.glb
│   │   └── cartoon-teeth-set.glb
│   └── projects/
│       ├── kanban/preview.png
│       ├── realtime-chat/preview.png
│       └── silkworm/preview.png
│
├── src/
│   ├── main.tsx                # React root + CursorProvider + Analytics
│   ├── App.tsx                 # Entry component: loader, routing, lazy Desktop/Cursor
│   │
│   ├── types/
│   │   ├── cursor.ts           # CursorType union
│   │   ├── fileSystem.ts       # BaseItem/FileItem/FolderItem/AppItem/SystemItem
│   │   └── windowState.ts      # WindowInstance interface
│   │
│   ├── constants/
│   │   ├── responsive.ts       # Media query constants & helpers
│   │   ├── windowLayout.ts     # Window metrics, sizing helpers, scale wrappers
│   │   ├── windowAnimation.ts  # Animation duration constant
│   │   └── zIndex.ts           # Z-index constants
│   │
│   ├── contexts/
│   │   ├── cursor.ts           # CursorContext definition + useCursor hook
│   │   └── CursorContext.tsx    # CursorProvider: base/override cursor state
│   │
│   ├── hooks/
│   │   ├── useCustomCursor.ts  # Hook: withCursor() mouse enter/leave helper
│   │   └── useScale.ts         # Hook: viewport-based scaling
│   │
│   ├── store/
│   │   ├── useFileSystem.ts    # Zustand store: virtual filesystem (items, positions)
│   │   └── useWindowManager.ts # Zustand store: window lifecycle (open/focus/move/close)
│   │
│   ├── data/
│   │   └── portfolio.ts        # Portfolio data: profile, projects, experience, etc.
│   │
│   ├── utils/
│   │   ├── assets.ts           # getAssetPath() - base URL aware asset resolution
│   │   ├── storage.ts          # Throttled localStorage + versioned storage helpers
│   │   └── uiScale.ts          # UI scale factor logic (1x/1.5x/2x)
│   │
│   ├── global/styles/
│   │   ├── index.scss          # Root CSS vars, scale presets, global styles
│   │   ├── _vars.scss          # Colors, z-index SCSS vars, ui() function
│   │   ├── _mixins.scss        # textMain, textTitle, pattern mixins
│   │   ├── _reset.scss         # CSS reset
│   │   └── _fonts.scss         # @font-face declarations
│   │
│   └── components/
│       ├── Desktop/            # Main desktop: icons + windows + keyboard nav
│       ├── Topbar/             # Mac-style menu bar with dropdowns + clock
│       ├── Loader/             # Boot animation: SVG pixel-art "hello" sketch
│       │
│       ├── Folder/             # Desktop icon components
│       │   ├── Folder.tsx      # Container: drag, open, trash
│       │   ├── FinderIcon.tsx  # SVG icons (folder, file, app, trash, contacts)
│       │   ├── FinderItem.tsx  # Positioned wrapper with active/inactive states
│       │   └── FinderLabel.tsx # Text label under icon
│       │
│       ├── Window/             # Heavy-weight window system
│       │   ├── Window.tsx              # Main window: composition root
│       │   ├── WindowContainer.tsx     # Reads store, renders Window
│       │   ├── WindowAppContent.tsx    # Lazy-loads apps by type
│       │   ├── WindowDocumentContent.tsx # Renders DocumentBlock[] content
│       │   ├── WindowFolderContent.tsx # Renders folder items in grid
│       │   ├── WindowTitleBar.tsx      # Close/zoom buttons + title
│       │   ├── WindowDragLayer.tsx     # framer-motion drag with proxy
│       │   ├── WindowResizeLayer.tsx   # Resize handle with proxy
│       │   ├── WindowScrollbars.tsx    # Custom scrollbar UI
│       │   ├── WindowFinderData.tsx    # "X items, Y in disk" footer
│       │   ├── windowGeometry.ts       # Clamp, contain, resize helpers
│       │   └── hooks/
│       │       ├── useWindowFitToContent.ts  # Zoom-to-fit logic
│       │       └── useWindowScrollbars.ts    # Scroll metrics & thumb drag
│       │
│       ├── WindowOpenAnimation/ # Open/close window morph animation
│       │   ├── WindowOpenAnimation.tsx       # Provider: animated proxy divs
│       │   ├── WindowOpenAnimationContext.ts # Context + useWindowOpenAnimation hook
│       │   └── WindowOpenAnimation.module.scss
│       │
│       ├── CustomCursor/       # SVG cursor overlay (hidden on coarse pointers)
│       │
│       ├── UIKit/              # Reusable Mac-style UI components
│       │   ├── MacButton/      # Button with multi-layer SVG border
│       │   ├── MacTextInput/   # Styled text input
│       │   ├── MacSlider/      # Slider (built on MacProgress)
│       │   ├── MacProgress/    # Progress bar
│       │   ├── MacPromptDialog/ # Modal dialog with input + OK/Cancel
│       │   └── PopupSelect/    # Dropdown select
│       │
│       ├── IconPainter/        # App: 32x32 pixel icon editor
│       │   ├── IconPainter.tsx           # Canvas, tools, history
│       │   ├── iconPainterDesktop.ts     # Desktop icon save/load library
│       │   └── IconPainter.module.scss
│       │
│       ├── DitherStudio/       # App: image dithering tool
│       │   ├── DitherStudio.tsx
│       │   ├── ditherCanvas.ts # Canvas processing
│       │   ├── ditherExport.ts # PNG/SVG export
│       │   ├── ditherTypes.ts  # Types & constants
│       │   └── DitherStudio.module.scss
│       │
│       ├── ModelViewerApp/     # App: 3D model viewer
│       │   ├── ModelViewerApp.tsx
│       │   └── ModelViewerApp.module.scss
│       │
│       ├── BadgeGenerator/     # App: digital business card badge
│       │   ├── BadgeGenerator.tsx
│       │   ├── badgeCard.ts    # SVG generation, QR code, sharing
│       │   └── BadgeGenerator.module.scss
│       │
│       ├── BadgeSharePage/     # Standalone shared badge route (/badge?data=...)
│       │   ├── BadgeSharePage.tsx
│       │   └── BadgeSharePage.module.scss
│       │
│       └── ProjectModelViewer/ # 3D model scene (R3F) for project case studies
│           ├── ProjectModelViewer.tsx
│           └── ProjectModelViewer.module.scss
```

---

## Utility Modules

These are highly critical non-UI modules in the project, located in `src/utils/`:

| Module | Location | Purpose |
|--------|----------|---------|
| **Asset Resolver** | `src/utils/assets.ts` | `getAssetPath()` — resolves asset URLs with base path awareness, crucial for supporting deep subpaths such as GitHub Pages deployments. |
| **Throttled Storage** | `src/utils/storage.ts` | `createThrottledLocalStorage(delay)` — debounces writes to localStorage (defaults to 250ms) to ensure continuous 60fps window-dragging/resizing; also exposes versioned storage readers/writers with migration pipelines. |
| **UI Scaler** | `src/utils/uiScale.ts` | Exposes layout helpers `getUiScale()`, `scaleUiValue()`, and `scaleUiSize()` which scale absolute numbers based on the active device profile (1x, 1.5x, 2x) matching custom CSS property `--ui-scale`. |

---

## Where to Look First for Common Tasks

- **To change a global state behavior:** Start in `src/store/`.
- **To modify the appearance of the OS UI:** Check `src/components/Window/`, `src/components/Desktop/`, or `src/components/Topbar/`.
- **To add a new application:** Create a new directory under `src/components/`, then hook it up in `src/components/Window/WindowAppContent.tsx` and register an item in `src/store/useFileSystem.ts`.
- **To modify static resources:** Look inside `public/`. Note that dynamically referenced assets must be handled using the `getAssetPath()` utility.
