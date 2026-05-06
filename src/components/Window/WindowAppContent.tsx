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

interface WindowAppContentProps {
  app: AppItem["app"];
}

export const WindowAppContent = memo(function WindowAppContent({
  app,
}: WindowAppContentProps) {
  return (
    <Suspense fallback={<div className={s.contentText}>Loading...</div>}>
      {app === "icon-painter" && <IconPainter />}
      {app === "dither-studio" && <DitherStudio />}
    </Suspense>
  );
});

