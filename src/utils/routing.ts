// src/utils/routing.ts
// IMPORTANT: When adding a new route/app here, you must also add it to the 
// ROUTE_METADATA mapping inside `vite.config.mjs` so it receives correct 
// SEO metadata pre-rendering and gets included in `sitemap.xml`!

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

export interface RouteMeta {
  title: string;
  description: string;
  ogTitle: string;
}

export const ROUTE_METADATA: Record<string, RouteMeta> = {
  "": {
    title: "ib1zza",
    description: "Interactive 3D portfolio by Mikhail (ib1zza) — a retro Macintosh desktop experience built with React & Three.js",
    ogTitle: "Mikhail (ib1zza) — Classic Macintosh Portfolio",
  },
  projects: {
    title: "Projects — ib1zza",
    description: "Browse the web applications, utility tools, and interactive 3D graphics projects built by Mikhail (ib1zza).",
    ogTitle: "Projects — Mikhail (ib1zza)",
  },
  about: {
    title: "About Me — ib1zza",
    description: "Learn more about Mikhail (ib1zza), frontend engineer and creative developer. Skills, stack, and interests.",
    ogTitle: "About Me — Mikhail (ib1zza)",
  },
  education: {
    title: "Education — ib1zza",
    description: "Educational background, university studies, and certifications of frontend engineer Mikhail (ib1zza).",
    ogTitle: "Education — Mikhail (ib1zza)",
  },
  contact: {
    title: "Contact & Links — ib1zza",
    description: "Get in touch with Mikhail (ib1zza) via Telegram, Github, Email, and social platforms.",
    ogTitle: "Contact — Mikhail (ib1zza)",
  },
  "icon-painter": {
    title: "Icon Painter — ib1zza",
    description: "Draw pixel art icons in a classic Macintosh Finder-style editor. Save, export, and customize desktop items.",
    ogTitle: "Icon Painter — Classic Macintosh Editor",
  },
  "dither-studio": {
    title: "Dither Studio — ib1zza",
    description: "Upload images and apply retro 1-bit or custom dither algorithms in real time. Perfect retro game art generation.",
    ogTitle: "Dither Studio — Retro Dithering Tool",
  },
  "dither-camera": {
    title: "Dither Camera — ib1zza",
    description: "Capture retro style 1-bit dithered photos directly using your webcam in this classic retro Mac camera app.",
    ogTitle: "Dither Camera — 1-bit Dither Camera",
  },
  "model-viewer": {
    title: "3D Model Viewer — ib1zza",
    description: "View and interact with 3D retro models using classic wireframe and flat rendering filters.",
    ogTitle: "3D Model Viewer — Retro 3D Graphics",
  },
  "badge-generator": {
    title: "Badge Generator — ib1zza",
    description: "Generate retro-style badges, stickers, and credentials. Custom layouts, colors, and graphics export.",
    ogTitle: "Badge Generator — Retro Sticker Creator",
  },
  "audio-player": {
    title: "Audio Player — ib1zza",
    description: "Listen to lo-fi retro audio tunes in a Winamp-inspired classic Mac audio player component.",
    ogTitle: "Audio Player — Retro Tunes Player",
  },
  "video-player": {
    title: "Video Player — ib1zza",
    description: "Play vintage video files inside a QuickTime-style classic player component.",
    ogTitle: "Video Player — Classic Movie Player",
  },
  "space-invaders": {
    title: "Space Invaders — ib1zza",
    description: "Play a classic 80s arcade Space Invaders game cloned for retro Macintosh aesthetic.",
    ogTitle: "Space Invaders — Retro Macintosh Game",
  },
  assistant: {
    title: "AI Assistant — ib1zza",
    description: "Ask Mac assistant about Mikhail's projects, experience, stack, and easter eggs in this retro terminal chat.",
    ogTitle: "AI Assistant — Interactive Mac Terminal",
  },
  badge: {
    title: "Badge — ib1zza",
    description: "Create and customize your developer badge in this retro card generator.",
    ogTitle: "Developer Badge Creator — ib1zza",
  },
};
