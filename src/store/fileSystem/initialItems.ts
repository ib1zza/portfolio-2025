import { portfolio } from "../../data/portfolio";
import {
  readSavedIcons,
  type SavedDesktopIcon,
} from "../../components/IconPainter/iconPainterDesktop";
import type { FileSystemItem } from "./types";
import type { Position } from "./types";
import {
  ROOT_FOLDER_ITEM_IDS,
  ROOT_APP_ITEM_IDS,
  ROOT_FILE_ITEM_IDS,
  ROOT_SYSTEM_ITEM_IDS,
  getTrashPosition,
  recalculateRootPositions,
} from "./layout";
import {
  aboutContent,
  educationContent,
  contactsContent,
  creditsContent,
  timeMachineScreenshotContent,
  futureProjectsContent,
  readmeFrom2035Content,
  lastDiskContent,
} from "./content";
import { formatProject } from "./content";

// ─── ID helpers ───────────────────────────────────────────────────────────────

export const GENERATED_FILE_ID_PREFIX = "saved-icon-";

export const savedIconItemId = (iconId: string) =>
  `${GENERATED_FILE_ID_PREFIX}${iconId}`;

export const isGeneratedFileItemId = (id: string) =>
  id.startsWith(GENERATED_FILE_ID_PREFIX);

/**
 * IDs in root that are neither auto-layout nor saved icons — e.g. timeMachineHd.
 */
export const getExtraRootItemIds = (children: string[]) =>
  children.filter(
    (childId) =>
      !ROOT_FOLDER_ITEM_IDS.includes(childId) &&
      !ROOT_APP_ITEM_IDS.includes(childId) &&
      !ROOT_FILE_ITEM_IDS.includes(childId) &&
      !ROOT_SYSTEM_ITEM_IDS.includes(childId) &&
      childId !== "trash" &&
      !isGeneratedFileItemId(childId),
  );

export const getRootChildren = (
  generatedFileIds: string[] = [],
  extraItemIds: string[] = [],
) => [
  ...ROOT_FOLDER_ITEM_IDS,
  ...ROOT_APP_ITEM_IDS,
  ...ROOT_FILE_ITEM_IDS,
  ...ROOT_SYSTEM_ITEM_IDS,
  ...extraItemIds,
  ...generatedFileIds,
  "trash",
];

// ─── Portfolio-derived items ───────────────────────────────────────────────────

const contactShortcutItems = portfolio.contacts.reduce<
  Record<string, FileSystemItem>
>((items, contact) => {
  const icon = contact.label.toLowerCase();

  if (
    icon !== "vk" &&
    icon !== "telegram" &&
    icon !== "email" &&
    icon !== "github"
  ) {
    return items;
  }

  items[`contact-${icon}`] = {
    id: `contact-${icon}`,
    name: contact.label,
    type: "link",
    parentId: "contact",
    href: contact.href,
    icon,
  };

  return items;
}, {});

const projectIdToSectionMap = new Map(
  portfolio.projectSections.flatMap((section) =>
    section.projectIds.map((projectId) => [projectId, section] as const),
  ),
);

const sectionItems = portfolio.projectSections.reduce<
  Record<string, FileSystemItem>
>((items, section) => {
  const sectionId = `project-section-${section.id}`;

  items[sectionId] = {
    id: sectionId,
    name: section.title,
    type: "folder",
    parentId: "projects",
    children: section.projectIds.map((projectId) => `project-${projectId}`),
  };

  return items;
}, {});

const projectItems = portfolio.projects.reduce<Record<string, FileSystemItem>>(
  (items, project) => {
    const folderId = `project-${project.id}`;
    const readmeId = `file-${project.id}-readme`;
    const section = projectIdToSectionMap.get(project.id);

    items[folderId] = {
      id: folderId,
      name: project.title,
      type: "folder",
      parentId: section ? `project-section-${section.id}` : "projects",
      children: [readmeId],
    };

    items[readmeId] = {
      id: readmeId,
      name: "Readme",
      type: "file",
      parentId: folderId,
      content: formatProject(project),
    };

    return items;
  },
  {},
);

// ─── Saved icon items ─────────────────────────────────────────────────────────

const buildSavedIconItem = (icon: SavedDesktopIcon): FileSystemItem => ({
  id: savedIconItemId(icon.id),
  name: icon.name,
  type: "app",
  parentId: "root",
  position: { x: 0, y: 0 },
  app: "icon-painter",
  savedIconId: icon.id,
});

// ─── createInitialItems ───────────────────────────────────────────────────────

export const createInitialItems = (
  itemPositions: Record<string, Position> = {},
): Record<string, FileSystemItem> => {
  const savedIcons = readSavedIcons();
  const savedIconIds = savedIcons.map((icon) => savedIconItemId(icon.id));
  const savedIconItems = Object.fromEntries(
    savedIcons.map((icon) => [savedIconItemId(icon.id), buildSavedIconItem(icon)]),
  );

  const items: Record<string, FileSystemItem> = {
    root: {
      id: "root",
      name: "Desktop",
      type: "folder",
      parentId: null,
      children: getRootChildren(savedIconIds),
    },
    projects: {
      id: "projects",
      name: "Projects",
      type: "folder",
      parentId: "root",
      position: { x: 0, y: 0 },
      children: portfolio.projectSections.map(
        (section) => `project-section-${section.id}`,
      ),
    },
    about: {
      id: "about",
      name: "About Me",
      type: "folder",
      parentId: "root",
      position: { x: 0, y: 0 },
      children: ["aboutReadme"],
    },
    aboutReadme: {
      id: "aboutReadme",
      name: "Profile",
      type: "file",
      parentId: "about",
      content: aboutContent,
    },
    education: {
      id: "education",
      name: "Education",
      type: "folder",
      parentId: "root",
      position: { x: 0, y: 0 },
      children: ["educationReadme"],
    },
    educationReadme: {
      id: "educationReadme",
      name: "Schools",
      type: "file",
      parentId: "education",
      content: educationContent,
    },
    contact: {
      id: "contact",
      name: "Contact",
      type: "folder",
      parentId: "root",
      position: { x: 0, y: 0 },
      children: [
        "contact-telegram",
        "contact-vk",
        "contact-email",
        "contact-github",
        "contactReadme",
      ],
    },
    contactReadme: {
      id: "contactReadme",
      name: "Links",
      type: "file",
      parentId: "contact",
      content: contactsContent,
    },
    iconPainter: {
      id: "iconPainter",
      name: "Icon Painter",
      type: "app",
      parentId: "root",
      position: { x: 0, y: 0 },
      app: "icon-painter",
    },
    ditherStudio: {
      id: "ditherStudio",
      name: "Dither Studio",
      type: "app",
      parentId: "root",
      position: { x: 0, y: 0 },
      app: "dither-studio",
    },
    modelViewer: {
      id: "modelViewer",
      name: "Model Viewer",
      type: "app",
      parentId: "root",
      position: { x: 0, y: 0 },
      app: "model-viewer",
    },
    badgeGenerator: {
      id: "badgeGenerator",
      name: "Badge Generator",
      type: "app",
      parentId: "root",
      position: { x: 0, y: 0 },
      app: "badge-generator",
    },
    audioPlayer: {
      id: "audioPlayer",
      name: "Audio Player",
      type: "app",
      parentId: "root",
      position: { x: 0, y: 0 },
      app: "audio-player",
    },
    videoPlayer: {
      id: "videoPlayer",
      name: "Video Player",
      type: "app",
      parentId: "root",
      position: { x: 0, y: 0 },
      app: "video-player",
    },
    spaceInvaders: {
      id: "spaceInvaders",
      name: "Space Invaders",
      type: "app",
      parentId: "root",
      position: { x: 0, y: 0 },
      app: "space-invaders",
    },
    portfolioAssistant: {
      id: "portfolioAssistant",
      name: "Assistant",
      type: "app",
      parentId: "root",
      position: { x: 0, y: 0 },
      app: "portfolio-assistant",
    },
    terminal: {
      id: "terminal",
      name: "Terminal",
      type: "app",
      parentId: "root",
      position: { x: 0, y: 0 },
      app: "terminal",
    },
    ditherCamera: {
      id: "ditherCamera",
      name: "Dither Camera",
      type: "app",
      parentId: "root",
      position: { x: 0, y: 0 },
      app: "dither-camera",
    },
    credits: {
      id: "credits",
      name: "Credits",
      type: "file",
      parentId: "root",
      position: { x: 0, y: 0 },
      content: creditsContent,
    },
    easterEggLog: {
      id: "easterEggLog",
      name: "Easter Eggs",
      type: "file",
      parentId: "root",
      position: { x: 0, y: 0 },
      content: "",
      documentStyle: "easter-eggs-log",
    },
    timeMachineHd: {
      id: "timeMachineHd",
      name: "Time Machine HD",
      type: "system",
      parentId: "root",
      position: { x: 0, y: 0 },
      systemType: "disk",
      children: ["tmScreenshot1988", "tmFutureProjects", "tmReadme2035"],
    },
    tmScreenshot1988: {
      id: "tmScreenshot1988",
      name: "screenshot_1988.png",
      type: "file",
      parentId: "timeMachineHd",
      content: timeMachineScreenshotContent,
    },
    tmFutureProjects: {
      id: "tmFutureProjects",
      name: "future_projects.txt",
      type: "file",
      parentId: "timeMachineHd",
      content: futureProjectsContent,
    },
    tmReadme2035: {
      id: "tmReadme2035",
      name: "README_FROM_2035.txt",
      type: "file",
      parentId: "timeMachineHd",
      content: readmeFrom2035Content,
    },
    tmLastDisk: {
      id: "tmLastDisk",
      name: "LAST_DISK.img",
      type: "file",
      parentId: "timeMachineHd",
      content: lastDiskContent,
      documentStyle: "centered-note",
    },
    mediaHd: {
      id: "mediaHd",
      name: "Media",
      type: "system",
      parentId: "root",
      position: { x: 0, y: 0 },
      systemType: "disk",
      children: ["mediaPhoto", "mediaVideo", "mediaMusic"],
    },
    mediaPhoto: {
      id: "mediaPhoto",
      name: "Photo",
      type: "folder",
      parentId: "mediaHd",
      children: ["mediaPhoto8", "mediaPhotoPaul", "mediaPhotoTorretto"],
    },
    mediaPhoto8: {
      id: "mediaPhoto8",
      name: "8.png",
      type: "file",
      parentId: "mediaPhoto",
      content: "",
      openWithApp: "image-viewer",
      fileUrl: "media/photo/8.png",
    },
    mediaPhotoPaul: {
      id: "mediaPhotoPaul",
      name: "paul.jpg",
      type: "file",
      parentId: "mediaPhoto",
      content: "",
      openWithApp: "image-viewer",
      fileUrl: "media/photo/paul.jpg",
    },
    mediaPhotoTorretto: {
      id: "mediaPhotoTorretto",
      name: "torretto.jpg",
      type: "file",
      parentId: "mediaPhoto",
      content: "",
      openWithApp: "image-viewer",
      fileUrl: "media/photo/torretto.jpg",
    },
    mediaVideo: {
      id: "mediaVideo",
      name: "Video",
      type: "folder",
      parentId: "mediaHd",
      children: ["mediaVideoCliff"],
    },
    mediaVideoCliff: {
      id: "mediaVideoCliff",
      name: "cliff.mp4",
      type: "file",
      parentId: "mediaVideo",
      content: "",
      openWithApp: "video-viewer",
      fileUrl: "media/video/cliff.mp4",
    },
    mediaMusic: {
      id: "mediaMusic",
      name: "Music",
      type: "folder",
      parentId: "mediaHd",
      children: ["mediaMusicHellrunner"],
    },
    mediaMusicHellrunner: {
      id: "mediaMusicHellrunner",
      name: "hellrunner.mp3",
      type: "file",
      parentId: "mediaMusic",
      content: "",
      openWithApp: "audio-player",
      fileUrl: "media/music/hellrunner.mp3",
    },
    hypercardStack: {
      id: "hypercardStack",
      name: "HyperCard Stack",
      type: "app",
      parentId: "root",
      position: { x: 0, y: 0 },
      app: "hypercard-stack",
    },
    trash: {
      id: "trash",
      name: "Trash",
      type: "folder",
      parentId: "root",
      position: getTrashPosition(),
      children: [],
    },
    ...savedIconItems,
    ...contactShortcutItems,
    ...sectionItems,
    ...projectItems,
  };

  return recalculateRootPositions(items, itemPositions);
};
