# Built-in Applications

[← Back to README](./README.md)

The desktop environment includes several fully functional applications. These are implemented as standard React components and injected into the generic `Window` container.

## 1. Icon Painter

**Location:** `src/components/IconPainter/`

- **Purpose:** A 32x32 pixel canvas for drawing and editing icons.
- **Key Features:** Various tools (pencil, eraser, fill bucket), color selection, undo/redo history, and export capabilities.
- **State Dependencies:** Manages its own internal canvas state for drawing performance, separate from global stores until an icon is saved or exported.
- **Common Modification Points:** Tool implementations and export logic.

## 2. Dither Studio

**Location:** `src/components/DitherStudio/`

- **Purpose:** An image processing tool that applies classic dithering algorithms (like Floyd-Steinberg or Bayer) to convert images into a restricted color palette, matching the System 6 aesthetic.
- **Key Features:** Drag-and-drop image loading, algorithm selection, and real-time preview.
- **Risks/Gotchas:** Image processing can be computationally heavy. Ensure operations happen off the main thread or are sufficiently throttled to prevent freezing the UI.

## 3. Model Viewer (and Project Model Viewer)

**Location:** `src/components/ModelViewerApp/` and `src/components/ProjectModelViewer/`

- **Purpose:** An application to load and inspect 3D models (`.glb` files).
- **Architecture:** Wraps `@react-three/fiber` Canvas components inside standard OS windows.
- **Key Files:** Look for components handling the Three.js scene setup, lighting, and camera controls.
- **Risks/Gotchas:** The 3D context is isolated from the React DOM context. Be careful when attempting to pass DOM-specific events into the 3D scene. Ensure models are properly optimized for web to avoid huge memory spikes.

## 4. Badge Generator

**Location:** `src/components/BadgeGenerator/`

- **Purpose:** Creates digital business cards or badges.
- **Key Features:** Generates dynamic QR codes linking to specific URLs or portfolio elements.
- **Dependencies:** Relies on the `qrcode` package.

## 5. Space Invaders

**Location:** `src/components/SpaceInvaders/`

- **Purpose:** A 1-bit retro mini-game inspired by the classic arcade game.
- **Key Features:** Gameplay loops involving moving ships, shooting aliens, and destructible shields.
- **Architecture & Performance:** The game relies heavily on optimized rendering. Destructible elements (like shields) are drawn onto offscreen canvases using `ctx.clearRect` for localized damage, completely avoiding the severe performance cost of pixel-by-pixel `fillRect` redraws on every frame.

## 6. Portfolio Assistant

**Location:** `src/components/PortfolioAssistant/`

- **Purpose:** An interactive search and query tool for finding projects and documents.
- **Architecture & Performance:** The search engine uses optimized scoring logic (a single-pass reduce with inline insertion sort) to prevent UI lag when searching through a large volume of documents.

## 7. Terminal

**Location:** `src/components/Terminal/`

- **Purpose:** A retro Macintosh system command-line interface terminal.
- **Key Features:** Supports directory navigation (`cd`), file reading (`cat`), file listing (`ls`), app execution (`open`), about/info system queries, history, tab autocompletion, custom matrix animation screen, and character-accurate static block cursor.
- **State Dependencies:** Reads from `useFileSystem` for files and folders, uses `useWindowManager` to open apps, and integrates haptics.
- **Common Modification Points:** Command parser inside `executeCommand`, autocomplete key handling, and terminal line styles in `Terminal.module.scss`.

## 8. Audio Player

**Location:** `src/components/AudioPlayer/`

- **Purpose:** An application for playing audio files.
- **Key Features:** Play, pause, volume control, and progress tracking.

## 9. Video Player & Simple Video Player

**Location:** `src/components/VideoPlayer/` and `src/components/SimpleVideoPlayer/`

- **Purpose:** Applications for playing video files. `VideoPlayer` includes advanced dither-processed playback using `useThreeDither`, while `SimpleVideoPlayer` provides basic video playback.
- **Key Features:** Dithered video processing, looping playback by default.
- **Risks/Gotchas:** Dithered video processing can be computationally intensive on lower-end devices.

## 10. Dither Camera


**Location:** `src/components/DitherCamera/`

- **Purpose:** Real-time camera stream processing tool.
- **Key Features:** Captures camera input and applies live 3D dithering effects, with snapshot functionality.

## Integration Rules for Apps

When modifying an existing app or creating a new one:

1. **Window Wrapping:** Apps should not render their own outer window chrome. They should assume they are rendered inside a `WindowAppContent` or similar wrapper provided by `src/components/Window/`.
2. **Topbar Menus:** If an app requires custom menu items (e.g., "File -> Export"), it should communicate this context to the global `Topbar` state when focused.
3. **Asset References:** Ensure any default files or models loaded by apps correctly reference paths using utilities from `src/utils/assets.ts`.



<!-- minor doc update to force commit -->
