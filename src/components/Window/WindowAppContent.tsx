import { lazy, memo, Suspense } from "react";

import type { AppItem } from "../../store/useFileSystem";
import s from "./Window.module.scss";

const IconPainter = lazy(() =>
  import("../IconPainter").then((module) => ({
    default: module.IconPainter,
  })),
);

const DitherStudio = lazy(() =>
  import("../DitherStudio").then((module) => ({
    default: module.DitherStudio,
  })),
);

const ModelViewerApp = lazy(() =>
  import("../ModelViewerApp").then((module) => ({
    default: module.ModelViewerApp,
  })),
);

const BadgeGenerator = lazy(() =>
  import("../BadgeGenerator").then((module) => ({
    default: module.BadgeGenerator,
  })),
);

const AudioPlayer = lazy(() =>
  import("../AudioPlayer").then((module) => ({
    default: module.AudioPlayer,
  })),
);

const VideoPlayer = lazy(() =>
  import("../VideoPlayer").then((module) => ({
    default: module.VideoPlayer,
  })),
);

const SpaceInvaders = lazy(() =>
  import("../SpaceInvaders").then((module) => ({
    default: module.SpaceInvaders,
  })),
);

const PortfolioAssistant = lazy(() =>
  import("../PortfolioAssistant").then((module) => ({
    default: module.PortfolioAssistant,
  })),
);

const HyperCardStack = lazy(() =>
  import("../../features/easter-eggs/components/HyperCardStack").then(
    (module) => ({
      default: module.HyperCardStack,
    }),
  ),
);

const ImageViewer = lazy(() =>
  import("../ImageViewer").then((module) => ({
    default: module.ImageViewer,
  })),
);

const SimpleVideoPlayer = lazy(() =>
  import("../SimpleVideoPlayer").then((module) => ({
    default: module.SimpleVideoPlayer,
  })),
);

const Terminal = lazy(() =>
  import("../Terminal").then((module) => ({
    default: module.Terminal,
  })),
);

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
