import { useFileSystem } from "../store/useFileSystem";

const PATH_TO_ITEM_ID: Record<string, string> = {
  projects: "projects",
  about: "about",
  education: "education",
  contact: "contact",
  "icon-painter": "iconPainter",
  "dither-studio": "ditherStudio",
  "dither-camera": "ditherCamera",
  "model-viewer": "modelViewer",
  "badge-generator": "badgeGenerator",
  "audio-player": "audioPlayer",
  "video-player": "videoPlayer",
  "space-invaders": "spaceInvaders",
  assistant: "portfolioAssistant",
  trash: "trash",
};

const ITEM_ID_TO_PATH: Record<string, string> = {
  projects: "projects",
  about: "about",
  education: "education",
  contact: "contact",
  iconPainter: "icon-painter",
  ditherStudio: "dither-studio",
  ditherCamera: "dither-camera",
  modelViewer: "model-viewer",
  badgeGenerator: "badge-generator",
  audioPlayer: "audio-player",
  videoPlayer: "video-player",
  spaceInvaders: "space-invaders",
  portfolioAssistant: "assistant",
  trash: "trash",
};

export const getFileSystemItemIdFromPath = (path: string): string | null => {
  const cleanPath = path.replace(/^\/|\/$/g, "").toLowerCase();
  if (!cleanPath) return null;

  if (PATH_TO_ITEM_ID[cleanPath]) {
    return PATH_TO_ITEM_ID[cleanPath];
  }

  const items = useFileSystem.getState().items;

  // Try direct ID match (case-insensitive)
  const matchedId = Object.keys(items).find(
    (id) => id.toLowerCase() === cleanPath,
  );
  if (matchedId) return matchedId;

  // Try path translation (e.g. /project-section-1 -> project-section-1)
  const normalizedPath = cleanPath.replace(/[^a-z0-9]/g, "");
  const matchedNormalizedId = Object.keys(items).find(
    (id) => id.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedPath,
  );
  if (matchedNormalizedId) return matchedNormalizedId;

  return null;
};

export const getItemPathFromId = (id: string): string => {
  if (ITEM_ID_TO_PATH[id]) {
    return ITEM_ID_TO_PATH[id];
  }
  return id.toLowerCase();
};
