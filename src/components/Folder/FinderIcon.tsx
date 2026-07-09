import { memo } from "react";

import IconPainterSvg from "../../assets/icons/icon-painter.svg?react";
import DitherStudioSvg from "../../assets/icons/dither-studio.svg?react";
import ModelViewerSvg from "../../assets/icons/model-viewer.svg?react";
import BadgeGeneratorSvg from "../../assets/icons/badge-generator.svg?react";
import AudioPlayerSvg from "../../assets/icons/audio-player.svg?react";
import VideoPlayerSvg from "../../assets/icons/video-player.svg?react";
import SpaceInvadersSvg from "../../assets/icons/space-invaders.svg?react";
import PortfolioAssistantSvg from "../../assets/icons/portfolio-assistant.svg?react";
import TerminalSvg from "../../assets/icons/terminal.svg?react";
import DitherCameraSvg from "../../assets/icons/dither-camera.svg?react";
import { TrashIcon } from "./FinderIcons/TrashIcon";
import { DiskIcon } from "./FinderIcons/DiskIcon";
import { FileAudioIcon } from "./FinderIcons/FileAudioIcon";
import { FileVideoIcon } from "./FinderIcons/FileVideoIcon";
import { FileImageIcon } from "./FinderIcons/FileImageIcon";
import { FileIcon } from "./FinderIcons/FileIcon";
import { VkIcon } from "./FinderIcons/VkIcon";
import { TelegramIcon } from "./FinderIcons/TelegramIcon";
import { EmailIcon } from "./FinderIcons/EmailIcon";
import { GithubIcon } from "./FinderIcons/GithubIcon";
import { FolderIcon } from "./FinderIcons/FolderIcon";
import { SavedIcon } from "./FinderIcons/SavedIcon";

export type FinderIconType =
  | "folder"
  | "disk"
  | "file"
  | "file-audio"
  | "file-video"
  | "file-image"
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
  | "app-portfolioAssistant"
  | "app-terminal"
  | "app-ditherCamera";

interface FinderIconProps {
  id: string;
  savedIconId?: string;
  type: FinderIconType;
}

export const FinderIcon = memo(function FinderIcon({
  id,
  savedIconId,
  type,
}: FinderIconProps) {
  const folderClipId = `folder-clip-${id}`;

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

  if (type === "app-terminal") return <TerminalSvg />;

  if (type === "app-ditherCamera") return <DitherCameraSvg />;

  if (type === "saved-icon") {
    return <SavedIcon savedIconId={savedIconId} />;
  }

  if (type === "trash") {
    return <TrashIcon />;
  }

  if (type === "disk") {
    return <DiskIcon />;
  }

  if (type === "file-audio") {
    return <FileAudioIcon />;
  }

  if (type === "file-video") {
    return <FileVideoIcon />;
  }

  if (type === "file-image") {
    return <FileImageIcon />;
  }

  if (type === "file") {
    return <FileIcon />;
  }

  if (type === "vk") {
    return <VkIcon />;
  }

  if (type === "telegram") {
    return <TelegramIcon />;
  }

  if (type === "email") {
    return <EmailIcon />;
  }

  if (type === "github") {
    return <GithubIcon />;
  }

  return (
    <FolderIcon
      folderClipId={folderClipId}
    />
  );
});


