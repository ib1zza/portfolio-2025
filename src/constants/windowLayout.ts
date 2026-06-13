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

const MOBILE_WINDOW_METRICS = {
  inset: 6,
  top: 27,
  bottom: 16,
} as const;

const WINDOW_BASE_METRICS = {
  topbarHeight: 21,
  titlebarHeight: 17,
  defaultPosition: { x: 200, y: 100 },
  defaultSize: { width: 400, height: 300 },
  minSize: { width: 300, height: 132 },
  resizeHandleSize: 15,
  titlebarButtonSafeArea: 30,
  openStartWidth: 28,
  appSize: { width: 580, height: 384 },
  largeAppSize: { width: 660, height: 420 },
  hyperCardSize: { width: 360, height: 270 },
  videoPlayerSize: { width: 720, height: 520 },
  gameSize: { width: 520, height: 480 },
  projectModelSize: { width: 900, height: 440 },
  documentNoteSize: { width: 360, height: 260 },
} as const;

export const isMobileWindowMode = () =>
  isMobilePointerMode();

export const getTopbarHeight = () =>
  scaleUiValue(WINDOW_BASE_METRICS.topbarHeight);

export const getWindowTitlebarHeight = () =>
  scaleUiValue(WINDOW_BASE_METRICS.titlebarHeight);

export const getDefaultWindowPosition = () => ({
  x: scaleUiValue(WINDOW_BASE_METRICS.defaultPosition.x),
  y: scaleUiValue(WINDOW_BASE_METRICS.defaultPosition.y),
});

export const getDefaultWindowSize = () =>
  scaleUiSize(WINDOW_BASE_METRICS.defaultSize);

export const getWindowMinSize = () =>
  scaleUiSize(WINDOW_BASE_METRICS.minSize);

export const getWindowResizeHandleSize = () =>
  scaleUiValue(WINDOW_BASE_METRICS.resizeHandleSize);

export const getWindowTitlebarButtonSafeArea = () =>
  scaleUiValue(WINDOW_BASE_METRICS.titlebarButtonSafeArea);

export const getWindowOpenStartWidth = () =>
  scaleUiValue(WINDOW_BASE_METRICS.openStartWidth);

export const getAppWindowSize = (app: WindowAppId) =>
  scaleUiSize(
  app === "space-invaders"
      ? WINDOW_BASE_METRICS.gameSize
      : app === "model-viewer" ||
          app === "badge-generator" ||
          app === "audio-player" ||
          app === "portfolio-assistant"
        ? WINDOW_BASE_METRICS.largeAppSize
        : app === "hypercard-stack"
          ? WINDOW_BASE_METRICS.hyperCardSize
        : app === "video-player" || app === "video-viewer"
          ? WINDOW_BASE_METRICS.videoPlayerSize
        : app === "image-viewer"
          ? WINDOW_BASE_METRICS.largeAppSize
          : WINDOW_BASE_METRICS.appSize,
  );

export const getVideoPlayerWindowSize = () =>
  scaleUiSize(WINDOW_BASE_METRICS.videoPlayerSize);

export const getDocumentNoteWindowSize = () =>
  scaleUiSize(WINDOW_BASE_METRICS.documentNoteSize);

export const getProjectModelWindowSize = () => ({
  width: Math.min(
    scaleUiValue(WINDOW_BASE_METRICS.projectModelSize.width),
    window.innerWidth,
  ),
  height: scaleUiValue(WINDOW_BASE_METRICS.projectModelSize.height),
});

export const getMobileWindowBounds = () => ({
  x: MOBILE_WINDOW_METRICS.inset,
  y: MOBILE_WINDOW_METRICS.top,
  width: Math.max(0, window.innerWidth - MOBILE_WINDOW_METRICS.inset * 2),
  height: Math.max(
    0,
    window.innerHeight -
      MOBILE_WINDOW_METRICS.top -
      MOBILE_WINDOW_METRICS.bottom,
  ),
});

export const getWindowTargetBounds = (
  position: WindowInstance["position"],
  size: WindowInstance["size"],
) => (isMobileWindowMode() ? getMobileWindowBounds() : { ...position, ...size });
