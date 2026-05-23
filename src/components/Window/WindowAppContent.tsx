import { lazy, memo, Suspense } from "react";

import type { AppItem } from "../../store/useFileSystem";
import s from "./Window.module.scss";

const IconPainter = lazy(() =>
  import("../IconPainter").then((module) => ({
    default: module.IconPainter,
  }))
);

const DitherStudio = lazy(() =>
  import("../DitherStudio").then((module) => ({
    default: module.DitherStudio,
  }))
);

const ModelViewerApp = lazy(() =>
  import("../ModelViewerApp").then((module) => ({
    default: module.ModelViewerApp,
  }))
);

const BadgeGenerator = lazy(() =>
  import("../BadgeGenerator").then((module) => ({
    default: module.BadgeGenerator,
  }))
);

const AudioPlayer = lazy(() =>
  import("../AudioPlayer").then((module) => ({
    default: module.AudioPlayer,
  }))
);

interface WindowAppContentProps {
  app: AppItem["app"];
  isActive: boolean;
  savedIconId?: string;
  title: string;
  windowId: string;
}

export const WindowAppContent = memo(function WindowAppContent({
  app,
  isActive,
  savedIconId,
  title,
  windowId,
}: WindowAppContentProps) {
  return (
    <Suspense fallback={<div className={s.contentText}>Loading...</div>}>
      {app === "icon-painter" && (
        <IconPainter savedIconId={savedIconId} savedIconName={title} />
      )}
      {app === "dither-studio" && <DitherStudio />}
      {app === "model-viewer" && (
        <ModelViewerApp isActive={isActive} windowId={windowId} />
      )}
      {app === "badge-generator" && <BadgeGenerator windowId={windowId} />}
      {app === "audio-player" && <AudioPlayer windowId={windowId} />}
    </Suspense>
  );
});
