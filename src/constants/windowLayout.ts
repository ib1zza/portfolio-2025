import type { WindowInstance } from "../store/useWindowManager";
import { isMobilePointerMode } from "./responsive";
import { scaleUiSize, scaleUiValue } from "../utils/uiScale";

export type WindowAppId =
  | "icon-painter"
  | "dither-studio"
  | "model-viewer"
  | "badge-generator"
  | "audio-player"
  | "video-player"
  | "space-invaders"
  | "portfolio-assistant"
  | "hypercard-stack"
  | "image-viewer"
  | "video-viewer";

// ─── Base sizes (plain numbers, unscaled) ────────────────────────────────

const SIZE = {
  topbarHeight: 21,
  titlebarHeight: 17,
  resizeHandleSize: 15,
  titlebarButtonSafeArea: 30,
  openStartWidth: 28,

  defaultPosition: { x: 200, y: 100 },
  defaultSize: { width: 400, height: 300 },
  minSize: { width: 300, height: 132 },

  // Per-app window sizes
  appSize: { width: 580, height: 380 },
  ditherStudioSize: { width: 580, height: 350 },
  modelViewerSize: { width: 680, height: 390 },
  audioPlayerSize: { width: 600, height: 450 },
  badgeGeneratorSize: { width: 710, height: 390 },
  largeAppSize: { width: 580, height: 420 },
  videoPlayerSize: { width: 600, height: 450 },
  portfolioAssistantSize: { width: 580, height: 440 },
  hyperCardSize: { width: 360, height: 270 },
  gameSize: { width: 540, height: 520 },
  projectModelSize: { width: 900, height: 440 },
  documentNoteSize: { width: 360, height: 260 },
} as const;

// ─── App → window size map ──────────────────────────────────────────────

const APP_WINDOW_SIZES: Record<WindowAppId, { width: number; height: number }> =
  {
    "icon-painter": SIZE.appSize,
    "dither-studio": SIZE.ditherStudioSize,
    "model-viewer": SIZE.modelViewerSize,
    "badge-generator": SIZE.badgeGeneratorSize,
    "audio-player": SIZE.audioPlayerSize,
    "video-player": SIZE.videoPlayerSize,
    "space-invaders": SIZE.gameSize,
    "portfolio-assistant": SIZE.portfolioAssistantSize,
    "hypercard-stack": SIZE.hyperCardSize,
    "image-viewer": SIZE.largeAppSize,
    "video-viewer": SIZE.videoPlayerSize,
  };

// ─── Mobile ──────────────────────────────────────────────────────────────

const readMobileWindowBoundsFromCss = () => {
  const probe = document.createElement("div");

  probe.style.position = "fixed";
  probe.style.top = "var(--mobile-window-top)";
  probe.style.left = "var(--mobile-window-inset)";
  probe.style.width = "calc(100vw - (var(--mobile-window-inset) * 2))";
  probe.style.height =
    "calc(100dvh - var(--mobile-window-top) - var(--mobile-window-bottom))";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";

  document.body.appendChild(probe);
  const rect = probe.getBoundingClientRect();
  probe.remove();

  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
};

// ─── Getters ─────────────────────────────────────────────────────────────

export const isMobileWindowMode = () => isMobilePointerMode();

export const getTopbarHeight = () => scaleUiValue(SIZE.topbarHeight);

export const getWindowTitlebarHeight = () => scaleUiValue(SIZE.titlebarHeight);

export const getDefaultWindowPosition = () => ({
  x: scaleUiValue(SIZE.defaultPosition.x),
  y: scaleUiValue(SIZE.defaultPosition.y),
});

export const getDefaultWindowSize = () => scaleUiSize(SIZE.defaultSize);

export const getWindowMinSize = () => scaleUiSize(SIZE.minSize);

export const getWindowResizeHandleSize = () =>
  scaleUiValue(SIZE.resizeHandleSize);

export const getWindowTitlebarButtonSafeArea = () =>
  scaleUiValue(SIZE.titlebarButtonSafeArea);

export const getWindowOpenStartWidth = () => scaleUiValue(SIZE.openStartWidth);

export const getAppWindowSize = (app: WindowAppId) =>
  scaleUiSize(APP_WINDOW_SIZES[app] ?? SIZE.appSize);

export const getVideoPlayerWindowSize = () => scaleUiSize(SIZE.videoPlayerSize);

export const getDocumentNoteWindowSize = () =>
  scaleUiSize(SIZE.documentNoteSize);

export const getProjectModelWindowSize = () => ({
  width: Math.min(scaleUiValue(SIZE.projectModelSize.width), window.innerWidth),
  height: scaleUiValue(SIZE.projectModelSize.height),
});

export const getMobileWindowBounds = () => readMobileWindowBoundsFromCss();

export const getWindowTargetBounds = (
  position: WindowInstance["position"],
  size: WindowInstance["size"],
) =>
  isMobileWindowMode() ? getMobileWindowBounds() : { ...position, ...size };
