import { memo, useEffect, useState } from "react";

import {
  createBlankIconPixels,
  ICON_DESKTOP_STORAGE_EVENT,
  readSavedIcon,
} from "../IconPainter/iconPainterDesktop";
import IconPainterSvg from "../../assets/icons/icon-painter.svg?react";
import DitherStudioSvg from "../../assets/icons/dither-studio.svg?react";
import ModelViewerSvg from "../../assets/icons/model-viewer.svg?react";
import BadgeGeneratorSvg from "../../assets/icons/badge-generator.svg?react";
import AudioPlayerSvg from "../../assets/icons/audio-player.svg?react";
import VideoPlayerSvg from "../../assets/icons/video-player.svg?react";
import SpaceInvadersSvg from "../../assets/icons/space-invaders.svg?react";
import PortfolioAssistantSvg from "../../assets/icons/portfolio-assistant.svg?react";

export type FinderIconType =
  | "folder"
  | "disk"
  | "file"
  | "saved-icon"
  | "trash"
  | "vk"
  | "telegram"
  | "email"
  | "github"
  | "app"
  | "app-iconPainter"
  | "app-modelViewer"
  | "app-badgeGenerator"
  | "app-ditherStudio"
  | "app-audioPlayer"
  | "app-videoPlayer"
  | "app-spaceInvaders"
  | "app-portfolioAssistant";

interface FinderIconProps {
  id: string;
  isOpenedInactive: boolean;
  savedIconId?: string;
  type: FinderIconType;
}

export const FinderIcon = memo(function FinderIcon({
  id,
  isOpenedInactive,
  savedIconId,
  type,
}: FinderIconProps) {
  const patternId = `opened-pattern-${id}`;
  const folderClipId = `folder-clip-${id}`;
  const openedFill = isOpenedInactive ? `url(#${patternId})` : "white";

  if (type === "app-iconPainter") {
    return <IconPainterSvg />;
  }

  if (type === "app-ditherStudio") return <DitherStudioSvg />;

  if (type === "app-modelViewer") return <ModelViewerSvg />;

  if (type === "app-badgeGenerator") return <BadgeGeneratorSvg />;

  if (type === "app-audioPlayer") return <AudioPlayerSvg />;

  if (type === "app-videoPlayer") return <VideoPlayerSvg />;

  if (type === "app-spaceInvaders") return <SpaceInvadersSvg />;

  if (type === "app-portfolioAssistant") return <PortfolioAssistantSvg />;

  if (type === "saved-icon") {
    return <SavedIcon savedIconId={savedIconId} />;
  }

  if (type === "trash") {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        <path d="M13 1H19V2H13V1Z" fill="white" />
        <path d="M6 3H26V4H6V3Z" fill="white" />
        <path
          d="M25 5H7V8H6V10H5V12H4V23H5V25H6V28H7V31H25V28H26V25H27V23H28V12H27V10H26V8H25V5Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M19 0H13V1H12V2H6V3H5V5H6V8H5V10H4V12H3V23H4V25H5V28H6V31H7V32H25V31H26V28H27V25H28V23H29V12H28V10H27V8H26V5H27V3H26V2H20V1H19V0ZM26 3V4H6V3H26ZM26 8V10H27V12H28V23H27V25H26V28H25V31H7V28H6V25H5V23H4V12H5V10H6V8H7V5H25V8H26ZM19 1V2H13V1H19Z"
          fill="black"
        />
        <path d="M14 8H15V10H14V8Z" fill="black" />
        <path d="M13 12V10H14V12H13Z" fill="black" />
        <path d="M13 23H12V12H13V23Z" fill="black" />
        <path d="M14 25V23H13V25H14Z" fill="black" />
        <path d="M14 25V28H15V25H14Z" fill="black" />
        <path
          d="M19 8H18V10H19V12H20V23H19V25H18V28H19V25H20V23H21V12H20V10H19V8Z"
          fill="black"
        />
        <path
          d="M22 7H21V8H22V10H23V12H24V23H23V25H22V28H23V25H24V23H25V12H24V10H23V8H22V7Z"
          fill="black"
        />
        <path d="M11 7H12V8H11V7Z" fill="black" />
        <path d="M10 10V8H11V10H10Z" fill="black" />
        <path d="M9 12V10H10V12H9Z" fill="black" />
        <path d="M9 23H8V12H9V23Z" fill="black" />
        <path d="M10 25H9V23H10V25Z" fill="black" />
        <path d="M11 28V25H10V28H11Z" fill="black" />
        <path d="M11 28V29H12V28H11Z" fill="black" />
      </svg>
    );
  }

  if (type === "disk") {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="1" y="20" width="30" height="8" fill="white" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M31 19H1V20H0V28H1V29H31V28H32V20H31V19ZM31 20V28H1V20H31Z"
          fill="black"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M31 19H1V20H0V28H1V29H31V28H32V20H31V19ZM31 20V28H1V20H31Z"
          fill="black"
          fill-opacity="0.2"
        />
        <rect x="4" y="25" width="2" height="1" fill="black" />
      </svg>
    );
  }

  if (type === "file") {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        <path d="M21 1H4V31H27V7H21V1Z" fill={openedFill} />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22 0V1H23V2H22V6H26V5H27V6H28V32H3V0H22ZM4 31H27V7H21V1H4V31Z"
          fill="black"
        />
        <path d="M25 4H26V5H25V4Z" fill="black" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24 3V2H23V3H24ZM24 3H25V4H24V3Z"
          fill="black"
        />
        <path d="M23 2H22V6H26V5H25V4H24V3H23V2Z" fill={openedFill} />
        <OpenedPattern id={patternId} />
      </svg>
    );
  }

  if (type === "vk") {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        <path d="M5 3H27V4H28V28H27V29H5V28H4V4H5V3Z" fill="black" />
        <path d="M5 4H27V28H5V4Z" fill="white" />
        <path d="M7 6H25V7H26V10H25V11H7V10H6V7H7V6Z" fill="black" />
        <path d="M8 7H24V9H8V7Z" fill="white" />
        <path
          d="M7 13H10V18H11V21H12V23H14V21H15V18H16V13H19V19H18V22H17V24H16V26H10V24H9V22H8V19H7V13Z"
          fill="black"
        />
        <path
          d="M19 13H22V18H23V17H24V15H25V13H27V16H26V18H25V20H24V21H25V23H26V26H24V24H23V22H22V26H19V13Z"
          fill="black"
        />
      </svg>
    );
  }

  if (type === "telegram") {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        <path
          d="M3 15H4V14H6V13H8V12H10V11H12V10H14V9H16V8H18V7H20V6H22V5H26V6H27V9H26V12H25V15H24V18H23V21H22V24H21V27H18V26H17V25H16V24H15V23H14V22H13V21H12V20H11V19H7V18H4V17H3V15Z"
          fill="black"
        />
        <path
          d="M6 15H8V14H10V13H12V12H14V11H16V10H18V9H20V8H22V7H24V8H23V11H22V14H21V17H20V20H19V23H18V22H17V21H16V20H15V19H14V18H13V17H10V16H6V15Z"
          fill="white"
        />
        <path
          d="M12 17H13V16H14V15H15V14H16V13H17V12H18V11H19V10H21V11H20V12H19V13H18V14H17V15H16V16H15V17H14V18H13V19H12V17Z"
          fill="black"
        />
      </svg>
    );
  }

  if (type === "email") {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
      >
        <path d="M3 9H29V10H30V24H29V25H3V24H2V10H3V9Z" fill="black" />
        <path d="M4 11H28V23H4V11Z" fill="white" />
        <path
          d="M5 12H7V13H8V14H9V15H10V16H11V17H12V18H13V19H14V20H18V19H19V18H20V17H21V16H22V15H23V14H24V13H25V12H27V13H26V14H25V15H24V16H23V17H22V18H21V19H20V20H19V21H13V20H12V19H11V18H10V17H9V16H8V15H7V14H6V13H5V12Z"
          fill="black"
        />
        <path
          d="M5 22H7V21H8V20H9V19H10V18H11V19H10V20H9V21H8V22H7V23H5V22Z"
          fill="black"
        />
        <path
          d="M27 22H25V21H24V20H23V19H22V18H21V19H22V20H23V21H24V22H25V23H27V22Z"
          fill="black"
        />
      </svg>
    );
  }

  if (type === "github") {
    return (
      <svg
        id="Github"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        shapeRendering="crispEdges"
      >
        <rect x="5" y="5" width="14" height="11" fill="white" />
        <rect x="3" y="16" width="14" height="3" fill="white" />
        <rect x="6" y="19" width="10" height="3" fill="white" />
        <rect x="9" y="22" width="6" height="1" fill="white" />
        <polygon
          fill="currentColor"
          points="23 9 23 15 22 15 22 17 21 17 21 19 20 19 20 20 19 20 19 21 18 21 18 22 16 22 16 23 15 23 15 18 14 18 14 17 15 17 15 16 17 16 17 15 18 15 18 14 19 14 19 9 18 9 18 6 16 6 16 7 15 7 15 8 14 8 14 7 10 7 10 8 9 8 9 7 8 7 8 6 6 6 6 9 5 9 5 14 6 14 6 15 7 15 7 16 9 16 9 18 7 18 7 17 6 17 6 16 4 16 4 17 5 17 5 19 6 19 6 20 9 20 9 23 8 23 8 22 6 22 6 21 5 21 5 20 4 20 4 19 3 19 3 17 2 17 2 15 1 15 1 9 2 9 2 7 3 7 3 5 4 5 4 4 5 4 5 3 7 3 7 2 9 2 9 1 15 1 15 2 17 2 17 3 19 3 19 4 20 4 20 5 21 5 21 7 22 7 22 9 23 9"
        />
      </svg>
    );
  }

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <g clipPath={`url(#${folderClipId})`}>
        <path
          d="M11 8H5V9H4V10H3V11H2V12H1V31H30V12H14V11H13V10H12V9H11V8Z"
          fill={openedFill}
        />
        <path d="M5 7H11V8H5V7Z" fill="black" />
        <path d="M4 9V8H5V9H4Z" fill="black" />
        <path d="M3 10V9H4V10H3Z" fill="black" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3 11V10H2V11H1V12H0V32H31V12H30V11H14V10H13V9H12V8H11V9H12V10H13V11H3ZM1 12V31H30V12H1Z"
          fill="black"
        />
      </g>
      <OpenedPattern id={patternId} />
      <defs>
        <clipPath id={folderClipId}>
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
});

const SavedIcon = memo(function SavedIcon({
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

const OpenedPattern = ({ id }: { id: string }) => (
  <defs>
    <pattern id={id} width="4" height="2" patternUnits="userSpaceOnUse">
      <rect width="4" height="2" fill="white" />
      <rect x="0" y="0" width="1" height="1" fill="black" />
      <rect x="2" y="1" width="1" height="1" fill="black" />
    </pattern>
  </defs>
);
