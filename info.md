# Portfolio 2025 — Architecture Overview

## 1. PROJECT IDENTITY

- **Name:** portfolio-2025
- **Author:** Mikhail Pshenichny (ib1zza)
- **Stack:** React 19, TypeScript 5.9, Vite 7, Zustand 5, Three.js 0.184, @react-three/fiber 9, Motion (framer-motion) 12, SCSS Modules
- **Deployment:** Vercel (SPA with rewrites to index.html)
- **PWA:** manifest.json, apple-touch-icons, PWA icons, `display: standalone`

---

## 2. DIRECTORY LAYOUT

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
├── STYLE_TOKENS.md             # Docs for CSS scaling system
├── Makefile                    # `make dev` -> npm run dev
├── README.md                   # Default Vite template README
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

## 3. ARCHITECTURE OVERVIEW

### 3.1. Concept: Desktop Metaphor

The entire UI is a tribute to classic Macintosh (System 6/7). The user interacts with a **virtual desktop** containing:

- **Finder-style icons** (folders, files, apps, links) arranged on a pixel grid
- **Windows** that open from icons with a morph animation
- **Topbar menu bar** with dropdown menus and a clock
- **Custom pixel-art cursors** replacing the native pointer

### 3.2. Entry Point (`src/main.tsx`)

```
<StrictMode>
  <CursorProvider>       # Custom cursor state
    <App />
    <Analytics />        # @vercel/analytics
  </CursorProvider>
</StrictMode>
```

### 3.3. App Boot Sequence (`src/App.tsx`)

1. Check if route is `/badge*` → render `<BadgeSharePage />` immediately (native cursor)
2. If desktop mode:
   - Media query check: enable custom cursor only on fine-pointer devices
   - Wait minimum **3 seconds** + lazy load of `Desktop` and `CustomCursor`
   - After both are ready: mount content under loader, then fade loader out after 1 frame

---

## 4. STATE MANAGEMENT

Both stores use **Zustand 5** with `persist` middleware + custom throttled localStorage.

### 4.1. `useFileSystem` (`src/store/useFileSystem.ts`)

The virtual filesystem defines all items on the desktop and inside folders.

**Item types:**
- `folder` — contains `children: string[]` (references to other items)
- `file` — has `content: string | DocumentBlock[]`
- `link` — external URL shortcut (VK, Telegram, GitHub, Email)
- `app` — launches one of 4 built-in apps

**Key store fields:**
- `items: Record<string, FileSystemItem>` — all items by ID
- `itemPositions: Record<string, Position>` — persisted icon positions
- `activeItemId: string | null` — keyboard-navigation highlight

**Persistence:**
- Key: `portfolio-2025-file-system`
- Only `itemPositions` is persisted (via `partialize`)
- Version 2 migration

**Desktop layout:**
- Items placed on a grid (`DESKTOP_GRID` / `MOBILE_GRID`)
- Grid computed from viewport width, starts at index 0 → 9 for built-in items
- Saved icons (from Icon Painter) placed starting at index 10

**Portfolio data integration:**
- `portfolio.ts` exports typed data (profile, projects, experience, education, contacts)
- `useFileSystem.createInitialItems()` transforms this data into the virtual filesystem:
  - Each project becomes a `folder` containing a `file` (Readme) with rich `DocumentBlock[]` content
  - Contact links become `link` items
  - 4 apps (Icon Painter, Dither Studio, Model Viewer, Badge Generator) are `app` items

**`DocumentBlock` union type:**
```ts
| { type: "title"; text: string }
| { type: "heading"; text: string }
| { type: "paragraph"; text: string }
| { type: "meta"; label: string; value: string }
| { type: "list"; items: string[] }
| { type: "links"; items: Array<{ label: string; href: string }> }
| { type: "projectModel"; model: ProjectModel }
| { type: "image"; src: string; alt: string; caption?: string }
```

### 4.2. `useWindowManager` (`src/store/useWindowManager.ts`)

Manages all open windows.

**Key store fields:**
- `windows: Record<string, WindowInstance>` — open windows by ID
- `windowIds: string[]` — ordered list
- `openFileIds: Record<string, true>` — set of open file IDs (to show "opened" icon state)
- `windowHistory: Record<string, {position, size}>` — persisted bounds per window
- `focusedWindowId: string | undefined`

**Actions:** `openWindow`, `closeWindow`, `closeFocusedWindow`, `closeAllWindows`, `focusWindow`, `moveWindow`, `updateWindowBounds`, `unfocusAll`, `resetWindows`

**Persistence:**
- Key: `portfolio-2025-window-manager`
- Only `windowHistory` is persisted
- Version 2 migration

---

## 5. COMPONENT HIERARCHY

```
App
├── Loader (shown during boot; hidden after 3s + lazy load)
├── Desktop (lazy loaded)
│   ├── Topbar
│   │   ├── Menu tabs (apple, File, Edit, Special)
│   │   └── Submenu dropdowns
│   ├── Folder[] (desktop icons)
│   │   ├── FinderItem (positioned wrapper)
│   │   ├── FinderIcon (SVG: folder/file/app/trash/contact/saved)
│   │   └── FinderLabel
│   └── WindowContainer[] (open windows)
│       └── Window
│           ├── WindowTitleBar (close + zoom buttons)
│           ├── WindowFinderData (item count footer)
│           ├── WindowScrollbars (custom scroll)
│           │   ├── WindowAppContent (lazy app)
│           │   │   ├── IconPainter
│           │   │   ├── DitherStudio
│           │   │   ├── ModelViewerApp
│           │   │   └── BadgeGenerator
│           │   ├── WindowDocumentContent (rich text)
│           │   │   └── ProjectModelViewer (R3F scene)
│           │   └── WindowFolderContent (nested items)
│           │       └── Folder[]
│           ├── WindowDragLayer (framer-motion drag)
│           └── WindowResizeLayer (resize handle)
├── CustomCursor (lazy, conditional on fine-pointer)
└── WindowOpenAnimation (animated proxy divs during open/close)
```

---

## 6. KEY ARCHITECTURAL PATTERNS

### 6.1. UI Scaling System

CSS custom property `--ui-scale` drives all dimensions:
- **1x** — mobile / coarse pointers
- **1.5x** — tablet with fine pointer (769–1023px)
- **2x** — desktop fine pointer (1024px+)

SCSS helper: `ui(16px)` → `calc(16px * var(--ui-scale))`
TS helper: `scaleUiValue(16)` — mirrors the same logic for JS dimensions

All window metrics in `src/constants/windowLayout.ts` use `scaleUiValue()` / `scaleUiSize()`.

### 6.2. Custom Cursor System

- `CursorProvider` manages `baseCursor` + `overrideCursor`
- `useCustomCursor()` returns `withCursor(type)` → spreads `onMouseEnter`/`onMouseLeave` handlers
- `CustomCursor` component renders an absolutely positioned `<div>` with CSS class matching cursor type
- On touch/coarse devices: `body.style.cursor = "default"`; on fine-pointer: `body.style.cursor = "none"`
- The `/badge` route always uses native cursor

### 6.3. Window Open/Close Animation

`WindowOpenAnimationProvider` wraps the desktop:
1. **Open:** capture source icon rect → animate proxy `<motion.div>` from icon size to target window bounds → after 200ms, replace proxy with real Window, remove proxy
2. **Close:** capture closing window rect → animate proxy shrinking back to icon → remove proxy after 200ms

Cursor switches to "watch" during animation.

### 6.4. Window Drag (Proxied)

- `WindowDragLayer` uses framer-motion `drag` on a transparent handle
- On drag: updates offset via rAF throttling → renders a ghost `windowProxy` div
- On drag end: commits final position to store, removes proxy

### 6.5. Window Resize (Proxied)

- `WindowResizeLayer` captures pointer events on a handle in the bottom-right corner
- During resize: throttled rAF updates a proxy div's dimensions
- On mouse up: commits final size + contained position to store

### 6.6. Keyboard Navigation

`Desktop` listens for arrow keys → spatial navigation using DOM rects:
- Finds the nearest item in the pressed direction using a weighted distance score
- Enter opens the active item (folder → window, app → window, link → new tab)
- Escape clears active item + unfocuses windows

### 6.7. Folder/Icon Drag

`Folder` component:
- Pointer down → set pointer capture → track move
- If moved past threshold (3px) → mark as drag
- On pointer up → if over trash element and item is saved icon → delete it
- Otherwise → commit new position to store

### 6.8. Lazy Loading

- Desktop and CustomCursor are lazy-loaded in App.tsx (after minimum 3s delay)
- App components (IconPainter, DitherStudio, ModelViewerApp, BadgeGenerator) are lazy-loaded inside `WindowAppContent`
- `ProjectModelViewer` (R3F) is lazy-loaded inside `WindowDocumentContent`

---

## 7. APPS (Built-in Applications)

### 7.1. Icon Painter (`src/components/IconPainter/`)
- 32×32 pixel grid editor
- Tools: pencil, eraser, flood fill
- Undo history (50 steps)
- Export as PNG or SVG
- Save to desktop (persists pixels in localStorage, creates an icon on the desktop grid)
- Saved icons can be deleted by dragging to Trash

### 7.2. Dither Studio (`src/components/DitherStudio/`)
- Image upload → apply dithering algorithms
- Modes: Bayer, Floyd-Steinberg, Atkinson, Sierra, etc.
- Controls: threshold, contrast, invert
- Export: PNG, SVG
- Output sizes: 64×64, 128×128, 256×256
- Can save result as a desktop icon

### 7.3. Model Viewer (`src/components/ModelViewerApp/`)
- Browse 3D models from portfolio projects
- Renders with React Three Fiber + GLTFLoader
- Orbit controls (drag to rotate)
- "Open Case Study" button opens the project window

### 7.4. Badge Generator (`src/components/BadgeGenerator/`)
- Digital business card with QR code
- Fields: name, role, company, about, contacts
- Icon: choose from previously saved pixel icons
- Generates a shareable URL (`/badge?data=...`)
- SVG + Canvas rendering

### 7.5. Badge Share Page (`src/components/BadgeSharePage/`)
- Standalone route: `/badge?data=<base64-encoded-badge-json>`
- Displays a shareable digital badge
- "Share" and "Save Image" buttons
- No desktop chrome, native cursor

---

## 8. DEPLOYMENT & BUILD

### 8.1. Vite Config (`vite.config.mjs`)
- Plugin: `@vitejs/plugin-react`, `vite-plugin-svgr`
- SCSS preprocessor: auto-injects `_vars.scss` and `_mixins.scss`
- Path alias: `@` → `./src`
- Base path: `/` for dev/production, `/portfolio-2025/` for GitHub Pages (`mode: "github"`)
- Manual chunk splitting:
  - `react-vendor`: react, react-dom, scheduler, react-reconciler
  - `react-three`: @react-three/*
  - `three`: three.js
  - `motion-vendor`: motion, motion-dom, motion-utils
  - `vendor`: everything else from node_modules

### 8.2. Scripts
- `npm run dev` — Vite dev server
- `npm run build` — TypeScript check + Vite build
- `npm run build:github` — build with GitHub Pages base path
- `npm run lint` — ESLint
- `npm run preview` — Vite preview server

### 8.3. Vercel (`vercel.json`)
- All routes rewrite to `/index.html` (SPA)
- Long-lived cache (1 year, immutable) for: assets, models, projects, fonts, cursors, icons
- No-cache for index.html and root

---

## 9. PUBLIC ASSETS

| Directory | Contents |
|-----------|----------|
| `public/cursors/` | 12 SVG cursor states (arrow, background, beam, busy, grab, grab_02, hand, pencil, precision, resize, resize_02, watch) |
| `public/fonts/` | ChiKareGo2 (Chicago-style), FindersKeepers (Geneva-style) |
| `public/icons/` | arrow, sparkle, logo_mac, happy_mac, sad_mac, icon-painter, dither-studio, model-viewer |
| `public/models/` | 7 GLB 3D models (cap, t-shirt, silkworm, simplex, printer-scanner, open-wardrobe-closet, cartoon-teeth-set) |
| `public/projects/` | Preview images for portfolio projects |

---

## 10. KEY TYPES

### FileSystemItem (unified store type)
```ts
type FileSystemItem = FolderItem | FileItem | LinkItem | AppItem

BaseItem:
  id, name, type, parentId?, position?, active?

FolderItem: type "folder", children: string[]
FileItem: type "file", content: string | DocumentBlock[]
LinkItem: type "link", href: string, icon: "vk"|"telegram"|"email"|"github"
AppItem: type "app", app: "icon-painter"|"dither-studio"|"model-viewer"|"badge-generator", savedIconId?
```

### WindowInstance
```ts
interface WindowInstance {
  id, title, parentId?, openerWindowId?, fileId?
  position: {x, y}, size: {width, height}, zIndex: number
}
```

### CursorType
```ts
type CursorType =
  "arrow"|"background"|"beam"|"busy"|"grab"|"grab_02"
  |"hand"|"pencil"|"precision"|"resize"|"resize_02"|"watch"
```

---

## 11. CONSTANTS & CONFIGURATION FILES

| File | Purpose |
|------|---------|
| `src/constants/responsive.ts` | Media query strings + `isMobilePointerMode()`, `isCoarsePointerMode()`, `isFinePointerMode()` |
| `src/constants/windowLayout.ts` | Window metrics (topbar, titlebar, min size, app sizes), `getDefaultWindowPosition()`, `getDefaultWindowSize()` |
| `src/constants/windowAnimation.ts` | `WINDOW_OPEN_ANIMATION_DURATION_MS = 200` |
| `src/constants/zIndex.ts` | `Z_INDEX.windowFocused = 100`, `Z_INDEX.windowProxy = 101` |
| `src/global/styles/_vars.scss` | SCSS vars: `$white`, `$black`, `$border`, `ui()` function |
| `src/global/styles/_mixins.scss` | `textMain`, `textTitle`, `pattern`, `pattern-mask-text`, `pattern-scroll` |
| `STYLE_TOKENS.md` | Documentation for the scaling system and CSS variable groups |

---

## 12. UTILITY MODULES

| Module | Purpose |
|--------|---------|
| `src/utils/assets.ts` | `getAssetPath()` — resolves asset URLs with BASE_URL (supports GitHub Pages) |
| `src/utils/storage.ts` | `createThrottledLocalStorage()` — debounced localStorage writes (250ms) with beforeunload flush; `readVersionedStorage()` / `writeVersionedStorage()` — versioned storage with migration support |
| `src/utils/uiScale.ts` | `getUiScale()` → 1 | 1.5 | 2; `scaleUiValue()` / `scaleUiSize()` |

---

## 13. STORE PERSISTENCE DETAILS

| Store | localStorage key | Version | Persisted data |
|-------|-----------------|---------|---------------|
| `useWindowManager` | `portfolio-2025-window-manager` | 2 | `windowHistory` (last position+size per window ID) |
| `useFileSystem` | `portfolio-2025-file-system` | 2 | `itemPositions` (icon positions per item ID) |
| Icon Painter | `portfolio-2025-icon-painter` | 1 | Editor state |
| Icon Desktop | `portfolio-2025-icon-painter-desktop` | 1 | Desktop-facing icon data |
| Icon Library | `portfolio-2025-icon-painter-library` | 1 | Full icon library |

Both Zustand stores use `createThrottledLocalStorage(250)` to batch writes and flush on `beforeunload`.
