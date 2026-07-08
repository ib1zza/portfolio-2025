import { memo, Suspense } from "react";

import type { AppItem } from "../../store/useFileSystem";
import s from "./Window.module.scss";
import { lazyWithPreload } from "../../utils/lazyWithPreload";

// eslint-disable-next-line react-refresh/only-export-components
export const preloadedApps = {
  IconPainter: lazyWithPreload(() =>
    import("../IconPainter").then((module) => ({
      default: module.IconPainter,
    })),
  ),
  DitherStudio: lazyWithPreload(() =>
    import("../DitherStudio").then((module) => ({
      default: module.DitherStudio,
    })),
  ),
  ModelViewerApp: lazyWithPreload(() =>
    import("../ModelViewerApp").then((module) => ({
      default: module.ModelViewerApp,
    })),
  ),
  BadgeGenerator: lazyWithPreload(() =>
    import("../BadgeGenerator").then((module) => ({
      default: module.BadgeGenerator,
    })),
  ),
  AudioPlayer: lazyWithPreload(() =>
    import("../AudioPlayer").then((module) => ({
      default: module.AudioPlayer,
    })),
  ),
  VideoPlayer: lazyWithPreload(() =>
    import("../VideoPlayer").then((module) => ({
      default: module.VideoPlayer,
    })),
  ),
  SpaceInvaders: lazyWithPreload(() =>
    import("../SpaceInvaders").then((module) => ({
      default: module.SpaceInvaders,
    })),
  ),
  PortfolioAssistant: lazyWithPreload(() =>
    import("../PortfolioAssistant").then((module) => ({
      default: module.PortfolioAssistant,
    })),
  ),
  HyperCardStack: lazyWithPreload(() =>
    import("../../features/easter-eggs/components/HyperCardStack").then(
      (module) => ({
        default: module.HyperCardStack,
      }),
    ),
  ),
  ImageViewer: lazyWithPreload(() =>
    import("../ImageViewer").then((module) => ({
      default: module.ImageViewer,
    })),
  ),
  SimpleVideoPlayer: lazyWithPreload(() =>
    import("../SimpleVideoPlayer").then((module) => ({
      default: module.SimpleVideoPlayer,
    })),
  ),
  Terminal: lazyWithPreload(() =>
    import("../Terminal").then((module) => ({
      default: module.Terminal,
    })),
  ),
};

interface WindowAppContentProps {
  app: AppItem["app"];
  isActive: boolean;
  savedIconId?: string;
  title: string;
  windowId: string;
  fileUrl?: string;
}

export const WindowAppContent = memo(function WindowAppContent({
  app,
  isActive,
  savedIconId,
  title,
  windowId,
  fileUrl,
}: WindowAppContentProps) {
  const IconPainter = preloadedApps.IconPainter.getLoaded() || preloadedApps.IconPainter.Component;
  const DitherStudio = preloadedApps.DitherStudio.getLoaded() || preloadedApps.DitherStudio.Component;
  const ModelViewerApp = preloadedApps.ModelViewerApp.getLoaded() || preloadedApps.ModelViewerApp.Component;
  const BadgeGenerator = preloadedApps.BadgeGenerator.getLoaded() || preloadedApps.BadgeGenerator.Component;
  const AudioPlayer = preloadedApps.AudioPlayer.getLoaded() || preloadedApps.AudioPlayer.Component;
  const VideoPlayer = preloadedApps.VideoPlayer.getLoaded() || preloadedApps.VideoPlayer.Component;
  const SpaceInvaders = preloadedApps.SpaceInvaders.getLoaded() || preloadedApps.SpaceInvaders.Component;
  const PortfolioAssistant = preloadedApps.PortfolioAssistant.getLoaded() || preloadedApps.PortfolioAssistant.Component;
  const HyperCardStack = preloadedApps.HyperCardStack.getLoaded() || preloadedApps.HyperCardStack.Component;
  const ImageViewer = preloadedApps.ImageViewer.getLoaded() || preloadedApps.ImageViewer.Component;
  const SimpleVideoPlayer = preloadedApps.SimpleVideoPlayer.getLoaded() || preloadedApps.SimpleVideoPlayer.Component;
  const Terminal = preloadedApps.Terminal.getLoaded() || preloadedApps.Terminal.Component;

  return (
    <Suspense fallback={<div className={s.contentText}>Loading...</div>}>
      {app === "icon-painter" && (
        <IconPainter
          savedIconId={savedIconId}
          savedIconName={title}
          windowId={windowId}
        />
      )}
      {app === "dither-studio" && <DitherStudio windowId={windowId} />}
      {app === "model-viewer" && (
        <ModelViewerApp isActive={isActive} windowId={windowId} />
      )}
      {app === "badge-generator" && <BadgeGenerator windowId={windowId} />}
      {app === "audio-player" && (
        <AudioPlayer windowId={windowId} fileUrl={fileUrl} />
      )}
      {app === "video-player" && (
        <VideoPlayer windowId={windowId} fileUrl={fileUrl} />
      )}
      {app === "space-invaders" && <SpaceInvaders windowId={windowId} />}
      {app === "portfolio-assistant" && <PortfolioAssistant />}
      {app === "hypercard-stack" && <HyperCardStack />}
      {app === "image-viewer" && (
        <ImageViewer windowId={windowId} fileUrl={fileUrl} />
      )}
      {app === "video-viewer" && (
        <SimpleVideoPlayer windowId={windowId} fileUrl={fileUrl} />
      )}
      {app === "terminal" && <Terminal windowId={windowId} />}
    </Suspense>
  );
});
