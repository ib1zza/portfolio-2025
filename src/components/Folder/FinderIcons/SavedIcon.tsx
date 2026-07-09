import { memo, useEffect, useState } from "react";

import {
  createBlankIconPixels,
  ICON_DESKTOP_STORAGE_EVENT,
  readSavedIcon,
} from "../../IconPainter/iconPainterDesktop";

export const SavedIcon = memo(function SavedIcon({
  savedIconId,
}: {
  savedIconId?: string;
}) {
  const [pixels, setPixels] = useState(
    () => readSavedIcon(savedIconId)?.pixels ?? createBlankIconPixels(),
  );

  useEffect(() => {
    const syncSavedIcon = () =>
      setPixels(readSavedIcon(savedIconId)?.pixels ?? createBlankIconPixels());

    window.addEventListener(ICON_DESKTOP_STORAGE_EVENT, syncSavedIcon);

    return () =>
      window.removeEventListener(ICON_DESKTOP_STORAGE_EVENT, syncSavedIcon);
  }, [savedIconId]);

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <rect width="32" height="32" fill="white" />
      {pixels.map((pixel, index) =>
        pixel ? (
          <rect
            key={index}
            x={index % 32}
            y={Math.floor(index / 32)}
            width="1"
            height="1"
            fill="black"
          />
        ) : null,
      )}
      <rect x="0.5" y="0.5" width="31" height="31" stroke="black" />
    </svg>
  );
});
