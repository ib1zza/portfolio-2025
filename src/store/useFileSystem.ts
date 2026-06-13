// src/store/useFileSystem.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  portfolio,
  type PortfolioProject,
  type ProjectModel,
} from "../data/portfolio";
import {
  deleteSavedIcon,
  readSavedIcons,
  type SavedDesktopIcon,
} from "../components/IconPainter/iconPainterDesktop";
import { EASTER_EGG_LOG_FILE_ID } from "../features/easter-eggs/easterEggDefinitions";
import { createThrottledLocalStorage } from "../utils/storage";
import { scaleUiValue } from "../utils/uiScale";

export interface Position {
  x: number;
  y: number;
}

export interface BaseItem {
  id: string;
  name: string;
  type: "folder" | "file" | "link" | "app" | "system";
  parentId?: string | null;
  position?: Position;
  active?: boolean;
}

export interface FolderItem extends BaseItem {
  type: "folder";
  children: string[];
}

export type DocumentBlock =
  | { type: "title"; text: string }
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "meta"; label: string; value: string }
  | { type: "list"; items: string[] }
  | { type: "links"; items: Array<{ label: string; href: string }> }
  | { type: "projectModel"; model: ProjectModel }
  | { type: "image"; src: string; alt: string; caption?: string };

export interface FileItem extends BaseItem {
  type: "file";
  content: string | DocumentBlock[];
  documentStyle?: "default" | "centered-note" | "easter-eggs-log";
}

export interface SystemItem extends BaseItem {
  type: "system";
  systemType: "disk";
  children: string[];
}

export interface LinkItem extends BaseItem {
  type: "link";
  href: string;
  icon: "vk" | "telegram" | "email" | "github";
}

export interface AppItem extends BaseItem {
  type: "app";
  app:
    | "icon-painter"
    | "dither-studio"
    | "model-viewer"
    | "badge-generator"
    | "audio-player"
    | "video-player"
    | "space-invaders"
    | "portfolio-assistant"
    | "hypercard-stack";
  savedIconId?: string;
}

export type FileSystemItem = FolderItem | FileItem | LinkItem | AppItem | SystemItem;

export const getChildItems = (
  items: Record<string, FileSystemItem>,
  parentId: string | null,
) => {
  const parent = parentId ? items[parentId] : undefined;

  if (parent?.type === "folder" || parent?.type === "system") {
    return parent.children
      .map((childId) => items[childId])
      .filter((item): item is FileSystemItem => Boolean(item));
  }

  return Object.values(items).filter((item) => item.parentId === parentId);
};

const formatProject = (project: PortfolioProject) =>
  [
    { type: "title", text: project.title },
    { type: "meta", label: "Year", value: project.year },
    { type: "meta", label: "Status", value: project.status },
    { type: "meta", label: "Role", value: project.role },
    ...(project.client
      ? [{ type: "meta" as const, label: "Client", value: project.client }]
      : []),
    ...(project.agency
      ? [{ type: "meta" as const, label: "Agency", value: project.agency }]
      : []),
    ...(project.period
      ? [{ type: "meta" as const, label: "Period", value: project.period }]
      : []),
    ...(project.availability
      ? [
          {
            type: "meta" as const,
            label: "Availability",
            value: project.availability,
          },
        ]
      : []),
    { type: "meta", label: "Stack", value: project.stack.join(", ") },
    { type: "paragraph", text: project.summary },
    ...(project.caseStudy
      ? [
          { type: "heading" as const, text: "Case Study" },
          {
            type: "meta" as const,
            label: "Problem",
            value: project.caseStudy.problem,
          },
          {
            type: "meta" as const,
            label: "Solution",
            value: project.caseStudy.solution,
          },
          ...(project.caseStudy.result
            ? [
                {
                  type: "meta" as const,
                  label: "Result",
                  value: project.caseStudy.result,
                },
              ]
            : []),
        ]
      : []),
    ...(project.responsibilities?.length
      ? [
          { type: "heading" as const, text: "Responsibilities" },
          { type: "list" as const, items: project.responsibilities },
        ]
      : []),
    ...(project.features?.length
      ? [
          { type: "heading" as const, text: "Features" },
          { type: "list" as const, items: project.features },
        ]
      : []),
    { type: "heading", text: "Highlights" },
    { type: "list", items: project.highlights },
    ...(project.metrics?.length
      ? [
          { type: "heading" as const, text: "Metrics" },
          {
            type: "list" as const,
            items: project.metrics.map((metric) =>
              [metric.label, metric.value, metric.note]
                .filter(Boolean)
                .join(" - "),
            ),
          },
        ]
      : []),
    ...(project.model
      ? [
          {
            type: "projectModel" as const,
            model: project.model,
          },
        ]
      : []),
    ...(project.accessNote
      ? [{ type: "paragraph" as const, text: project.accessNote }]
      : []),
    ...(project.images ?? []).map((image) => ({
      type: "image" as const,
      ...image,
    })),
    ...(project.links.length
      ? [
          { type: "heading" as const, text: "Links" },
          { type: "links" as const, items: project.links },
        ]
      : []),
  ] satisfies DocumentBlock[];

const aboutContent = [
  { type: "title", text: "About Me" },
  { type: "meta", label: "Name", value: portfolio.profile.name },
  { type: "meta", label: "Role", value: portfolio.profile.role },
  { type: "meta", label: "Location", value: portfolio.profile.location },
  { type: "paragraph", text: portfolio.profile.summary },
  { type: "heading", text: "Focus" },
  { type: "list", items: portfolio.profile.focus },
  { type: "heading", text: "Achievements" },
  { type: "list", items: portfolio.achievements },
  { type: "heading", text: "Skills" },
  { type: "paragraph", text: portfolio.skills.join(", ") },
  { type: "heading", text: "Experience" },
  ...portfolio.experience.flatMap<DocumentBlock>((item) => [
    {
      type: "meta",
      label: item.company,
      value: `${item.role}, ${item.period}`,
    },
    { type: "list", items: item.highlights },
  ]),
] satisfies DocumentBlock[];

const educationContent = [
  { type: "title", text: "Education" },
  ...portfolio.education.flatMap<DocumentBlock>((item) => [
    { type: "heading", text: item.place },
    { type: "meta", label: "Program", value: item.title },
    { type: "meta", label: "Period", value: item.period },
    { type: "paragraph", text: item.description },
  ]),
] satisfies DocumentBlock[];

const contactsContent = [
  { type: "title", text: "Contact" },
  { type: "links", items: portfolio.contacts },
] satisfies DocumentBlock[];

const timeMachineScreenshotContent = [
  {
    type: "image",
    src: "easter-eggs/screenshot_1988.png",
    alt: "A monochrome Macintosh desktop screenshot from 1988",
    caption: "Screenshot_1988.png",
  },
] satisfies DocumentBlock[];

const futureProjectsContent = `Future Project Ideas

* Build software that feels physical
* Explore procedural art
* Make smaller things with more care`;

const readmeFrom2035Content = `React 37 is finally stable.

CSS now has only 14 ways to center a div.

Most AI assistants spend their time helping people rename variables.

Somehow floppy disks are cool again.`;

const lastDiskContent = `Every computer becomes a museum piece eventually.

Some are remembered because of their hardware.

Some because of their software.

The lucky ones are remembered because somebody loved them.

Thanks for visiting.`;

const creditsContent = [
  { type: "title", text: "Credits & Licenses" },
  {
    type: "paragraph",
    text: "This portfolio is a personal, non-affiliated homage to early Macintosh interface culture. It combines original implementation work with credited references, fonts, icons, 3D assets, screenshots, and brand marks used to describe real projects.",
  },
  { type: "heading", text: "Apple Inspiration" },
  {
    type: "paragraph",
    text: "Special thanks to Apple and the designers of the original Macintosh, Finder, MacPaint, and System 6/System 7 interface language. The monochrome windows, menu bar, title stripes, pixel cursors, scrollbars, document metaphors, and interaction patterns in this site are built as a modern web tribute to that design era.",
  },
  {
    type: "paragraph",
    text: "This project is not affiliated with, endorsed by, or sponsored by Apple Inc. Apple, Macintosh, Finder, MacPaint, and related product names are trademarks of their respective owners.",
  },
  { type: "heading", text: "Design References" },
  {
    type: "list",
    items: [
      "Classic Macintosh UI Kit by Iftach: used as the primary visual reference for buttons, pop-up menus, window chrome, cursors, and classic Macintosh component proportions.",
      "Charlie Dean portfolio: credited as a contemporary portfolio reference and inspiration source.",
      "Gleb Solutions: credited as a contemporary web/portfolio reference and inspiration source.",
    ],
  },
  { type: "heading", text: "3D Models" },
  {
    type: "list",
    items: [
      "cartoon-teeth-set.glb: Cartoon Teeth Set from Get3DModels. Source lists author as poly by google and license as CC Attribution.",
      "open-wardrobe-closet.glb: Open Wardrobe Closet from Get3DModels. Source lists author as poly by google and license as CC Attribution.",
      "cap.glb: Low Poly Cap from Get3DModels. Source lists author as poly by google and license as CC Attribution.",
      "printer-scanner.glb: Office Printer from Get3DModels. Source lists author as Chenchanchong and license as CC Attribution.",
      "t-shirt.glb: local GLB contains mesh names based on Shirt_adid, but no reliable source/license metadata was found in the asset or public search results. Treat as source-to-verify before final production attribution, or replace with a model that has explicit license data.",
      "simplex.glb: Simplex project logo converted to GLB for case-study presentation. Treated as client/brand material used only to identify the commercial project.",
      "silkworm.glb: Silkworm project logo converted to GLB for case-study presentation. Treated as client/brand material used only to identify the commercial project.",
    ],
  },
  { type: "heading", text: "Fonts" },
  {
    type: "list",
    items: [
      "ChiKareGo2.ttf: pixel font by Giles Booth, based on the classic Macintosh Chicago direction by Susan Kare.",
      "FindersKeepers.ttf: font by Giles Booth, based on the 9pt Geneva/Finder label look documented by the author.",
      "Both fonts are used for the retro interface typography in this portfolio. If this project becomes commercial, keep the font source/license notes with the repository and replace any font whose redistribution status is unclear.",
    ],
  },
  { type: "heading", text: "Icons, Cursors, UI Assets" },
  {
    type: "list",
    items: [
      "Finder-style folder, file, app, contact, trash, and tool icons are custom SVG/pixel drawings created for this project or adapted from user-provided SVGs.",
      "VK, Telegram, Email, GitHub, trash, and Icon Painter icons were created/provided during the project and converted into the local 1-bit icon style.",
      "Cursor SVGs are local 1-bit recreations for arrow, hand, beam, grab, resize, pencil, precision, busy, and watch states.",
      "Happy Mac and Sad Mac style icons are used as nostalgic references to classic Macintosh system imagery, not as official Apple assets.",
    ],
  },
  { type: "heading", text: "Project Screenshots & Logos" },
  {
    type: "list",
    items: [
      "Project preview screenshots under /projects are used as portfolio case-study material for the author's own work.",
      "Simplex and Silkworm marks are used only as project identifiers inside their case studies.",
      "Generated Icon Painter, Dither Studio, and Badge Generator outputs are user-created assets stored locally in the browser.",
    ],
  },
  { type: "heading", text: "Open Source Runtime" },
  {
    type: "paragraph",
    text: "The site is built with React, TypeScript, Vite, Zustand, Three.js, React Three Fiber, Motion, QRCode, and related frontend tooling. Dependency licenses should be reviewed from package metadata before redistribution.",
  },
  { type: "heading", text: "Source Links" },
  {
    type: "links",
    items: [
      {
        label: "Classic Macintosh UI Kit by Iftach",
        href: "https://dribbble.com/shots/6102247-Classic-Macintosh-UI-Kit",
      },
      {
        label: "Classic Macintosh UI Kit product page",
        href: "https://gum.co/ClassicMacintoshUIKit",
      },
      {
        label: "Charlie Dean",
        href: "https://charliedean.com/portfolio",
      },
      {
        label: "Gleb Solutions",
        href: "https://gleb.solutions/",
      },
      {
        label: "Cartoon Teeth Set",
        href: "https://www.get3dmodels.com/anatomy/cartoon-teeth-set/",
      },
      {
        label: "Open Wardrobe Closet",
        href: "https://www.get3dmodels.com/fashion/open-wardrobe-closet/",
      },
      {
        label: "Low Poly Cap",
        href: "https://www.get3dmodels.com/fashion/low-poly-cap/",
      },
      {
        label: "Office Printer",
        href: "https://www.get3dmodels.com/architecture/office-printer/",
      },
      {
        label: "FindersKeepers by Giles Booth",
        href: "https://www.suppertime.co.uk/blogmywiki/2017/04/finderskeepers/",
      },
      {
        label: "ChiKareGo2 / FindersKeepers font mirror",
        href: "https://tilde.club/~georgemoody/fonts/",
      },
    ],
  },
] satisfies DocumentBlock[];

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
    const section = portfolio.projectSections.find((projectSection) =>
      projectSection.projectIds.includes(project.id),
    );

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

const STORAGE_KEY = "portfolio-2025-file-system";
const STORAGE_VERSION = 3;
const GENERATED_FILE_ID_PREFIX = "saved-icon-";
const savedIconItemId = (iconId: string) =>
  `${GENERATED_FILE_ID_PREFIX}${iconId}`;
const MOBILE_LAYOUT_BREAKPOINT = 768;
const FALLBACK_VIEWPORT_WIDTH = 1280;
const FALLBACK_VIEWPORT_HEIGHT = 800;
const MIN_VIEWPORT_WIDTH = 320;
const MIN_VIEWPORT_HEIGHT = 480;
const ROOT_FOLDER_ITEM_IDS: readonly string[] = [
  "about",
  "projects",
  "education",
  "contact",
];
const ROOT_APP_ITEM_IDS: readonly string[] = [
  "iconPainter",
  "ditherStudio",
  "modelViewer",
  "badgeGenerator",
  "audioPlayer",
  "videoPlayer",
  "spaceInvaders",
  "portfolioAssistant",
];
const ROOT_FILE_ITEM_IDS: readonly string[] = ["credits"];
const ROOT_LAYOUT_ITEM_IDS = new Set<string>([
  ...ROOT_FOLDER_ITEM_IDS,
  ...ROOT_APP_ITEM_IDS,
  ...ROOT_FILE_ITEM_IDS,
  "trash",
]);
const DESKTOP_GRID = {
  startX: 32,
  startY: 110,
  stepX: 104,
  stepY: 70,
} as const;
const DESKTOP_TRASH = {
  right: 32,
  bottom: 42,
  width: 72,
  height: 64,
} as const;
const MOBILE_GRID = {
  startX: 12,
  startY: 36,
  itemWidth: 64,
  stepY: 58,
  columns: 4,
} as const;
const MOBILE_APP_ROW_COUNTS = [3, 2] as const;
const MOBILE_GENERATED_START_ROW = 1 + MOBILE_APP_ROW_COUNTS.length;
const MOBILE_TRASH = {
  right: 12,
  bottom: 16,
  width: 64,
  height: 58,
} as const;
const WINDOW_GRID = {
  columns: 3,
  startX: 16,
  startY: 14,
  stepX: 112,
  stepY: 58,
} as const;

const getViewportMetrics = () => {
  const width =
    typeof window === "undefined"
      ? FALLBACK_VIEWPORT_WIDTH
      : Math.max(MIN_VIEWPORT_WIDTH, window.innerWidth);
  const height =
    typeof window === "undefined"
      ? FALLBACK_VIEWPORT_HEIGHT
      : Math.max(MIN_VIEWPORT_HEIGHT, window.innerHeight);

  return {
    width,
    height,
    isMobile: width < MOBILE_LAYOUT_BREAKPOINT,
  };
};

const isGeneratedFileItemId = (id: string) =>
  id.startsWith(GENERATED_FILE_ID_PREFIX);

const getRootChildren = (
  generatedFileIds: string[] = [],
  extraItemIds: string[] = [],
) => [
  ...ROOT_FOLDER_ITEM_IDS,
  ...ROOT_APP_ITEM_IDS,
  ...generatedFileIds,
  ...ROOT_FILE_ITEM_IDS,
  ...extraItemIds,
  "trash",
];

const getExtraRootItemIds = (children: string[]) =>
  children.filter(
    (childId) =>
      !ROOT_LAYOUT_ITEM_IDS.has(childId) && !isGeneratedFileItemId(childId),
  );

const getDesktopGridPosition = (index: number) => {
  const { width } = getViewportMetrics();
  const startX = scaleUiValue(DESKTOP_GRID.startX);
  const startY = scaleUiValue(DESKTOP_GRID.startY);
  const stepX = scaleUiValue(DESKTOP_GRID.stepX);
  const stepY = scaleUiValue(DESKTOP_GRID.stepY);
  const columns = Math.max(1, Math.floor((width - startX * 2) / stepX));

  return {
    x: startX + (index % columns) * stepX,
    y: startY + Math.floor(index / columns) * stepY,
  };
};

const getMobileColumnX = (columnIndex: number, columnCount: number) => {
  const { width } = getViewportMetrics();
  const safeColumnCount = Math.max(1, columnCount);
  const availableWidth = Math.max(
    0,
    width - MOBILE_GRID.startX * 2 - MOBILE_GRID.itemWidth,
  );

  if (safeColumnCount === 1) {
    return Math.round(MOBILE_GRID.startX + availableWidth / 2);
  }

  return Math.round(
    MOBILE_GRID.startX + (availableWidth * columnIndex) / (safeColumnCount - 1),
  );
};

const getMobileRowPosition = (
  rowIndex: number,
  columnIndex: number,
  columnCount: number = MOBILE_GRID.columns,
) => ({
  x: getMobileColumnX(columnIndex, columnCount),
  y: MOBILE_GRID.startY + rowIndex * MOBILE_GRID.stepY,
});

const getFolderPosition = (index: number) =>
  getViewportMetrics().isMobile
    ? getMobileRowPosition(0, index, ROOT_FOLDER_ITEM_IDS.length)
    : getDesktopGridPosition(index);

const getMobileAppPosition = (index: number) => {
  let remainingIndex = index;

  for (
    let rowIndex = 0;
    rowIndex < MOBILE_APP_ROW_COUNTS.length;
    rowIndex += 1
  ) {
    const rowCount = MOBILE_APP_ROW_COUNTS[rowIndex];

    if (remainingIndex < rowCount) {
      return getMobileRowPosition(1 + rowIndex, remainingIndex, rowCount);
    }

    remainingIndex -= rowCount;
  }

  return getMobileRowPosition(
    1 +
      MOBILE_APP_ROW_COUNTS.length +
      Math.floor(remainingIndex / MOBILE_GRID.columns),
    remainingIndex % MOBILE_GRID.columns,
  );
};

const getAppPosition = (index: number) =>
  getViewportMetrics().isMobile
    ? getMobileAppPosition(index)
    : getDesktopGridPosition(ROOT_FOLDER_ITEM_IDS.length + index);

const getGeneratedFilePosition = (index: number) =>
  getViewportMetrics().isMobile
    ? getMobileRowPosition(
        MOBILE_GENERATED_START_ROW + Math.floor(index / MOBILE_GRID.columns),
        index % MOBILE_GRID.columns,
      )
    : getDesktopGridPosition(
        ROOT_FOLDER_ITEM_IDS.length + ROOT_APP_ITEM_IDS.length + index,
      );

const getEasterEggLogPosition = (generatedFileCount: number) =>
  getGeneratedFilePosition(generatedFileCount + 2);

const getSavedIconPosition = (index: number) => getGeneratedFilePosition(index);

const getCreditsPosition = (generatedFileCount: number) =>
  getGeneratedFilePosition(generatedFileCount);

const getTimeMachinePosition = (generatedFileCount: number) =>
  getGeneratedFilePosition(generatedFileCount + 1);

const getTrashPosition = () => {
  const { width, height, isMobile } = getViewportMetrics();
  const trash = isMobile ? MOBILE_TRASH : DESKTOP_TRASH;
  const iconWidth = isMobile ? trash.width : scaleUiValue(trash.width);
  const iconHeight = isMobile ? trash.height : scaleUiValue(trash.height);
  const right = isMobile ? trash.right : scaleUiValue(trash.right);
  const bottom = isMobile ? trash.bottom : scaleUiValue(trash.bottom);

  return {
    x: Math.max(0, Math.round(width - right - iconWidth)),
    y: Math.max(0, Math.round(height - bottom - iconHeight)),
  };
};

const getCleanRootPosition = (
  item: FileSystemItem,
  siblings: FileSystemItem[],
) => {
  if (item.id === "trash") return getTrashPosition();
  if (item.id === EASTER_EGG_LOG_FILE_ID) {
    return getEasterEggLogPosition(
      siblings.filter((sibling) => isGeneratedFileItemId(sibling.id)).length,
    );
  }

  const folderIndex = ROOT_FOLDER_ITEM_IDS.indexOf(item.id);
  if (folderIndex >= 0) return getFolderPosition(folderIndex);

  const appIndex = ROOT_APP_ITEM_IDS.indexOf(item.id);
  if (appIndex >= 0) return getAppPosition(appIndex);

  const generatedFiles = siblings.filter((sibling) =>
    isGeneratedFileItemId(sibling.id),
  );

  if (isGeneratedFileItemId(item.id)) {
    return getSavedIconPosition(
      Math.max(
        0,
        generatedFiles.findIndex(
          (generatedFile) => generatedFile.id === item.id,
        ),
      ),
    );
  }

  if (item.id === "credits") {
    return getCreditsPosition(generatedFiles.length);
  }

  return getGeneratedFilePosition(
    generatedFiles.length + ROOT_FILE_ITEM_IDS.length,
  );
};

const isAutoLayoutRootItemId = (id: string) =>
  ROOT_LAYOUT_ITEM_IDS.has(id) || isGeneratedFileItemId(id);

const sanitizeStoredPositions = (
  itemPositions: Record<string, Position> = {},
  version = STORAGE_VERSION,
) => {
  const shouldDropAllPositions = version < 2;

  if (shouldDropAllPositions) return {};

  return Object.fromEntries(
    Object.entries(itemPositions).filter(([id]) => !isAutoLayoutRootItemId(id)),
  );
};

const readStoredPositions = () => {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    const version = typeof parsed.version === "number" ? parsed.version : 0;

    return sanitizeStoredPositions(parsed.state?.itemPositions ?? {}, version);
  } catch {
    return {};
  }
};

const createInitialItems = (itemPositions: Record<string, Position> = {}) => {
  const savedIcons = readSavedIcons();
  const savedIconIds = savedIcons.map((icon) => savedIconItemId(icon.id));
  const savedIconItems = savedIcons.reduce<Record<string, FileSystemItem>>(
    (items, icon, index) => {
      const itemId = savedIconItemId(icon.id);

      items[itemId] = {
        id: itemId,
        name: icon.name,
        type: "app",
        parentId: "root",
        position: getSavedIconPosition(index),
        app: "icon-painter",
        savedIconId: icon.id,
      };

      return items;
    },
    {},
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
      position: getFolderPosition(1),
      children: portfolio.projectSections.map(
        (section) => `project-section-${section.id}`,
      ),
    },
    about: {
      id: "about",
      name: "About Me",
      type: "folder",
      parentId: "root",
      position: getFolderPosition(0),
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
      position: getFolderPosition(2),
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
      position: getFolderPosition(3),
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
      position: getAppPosition(0),
      app: "icon-painter",
    },
    ditherStudio: {
      id: "ditherStudio",
      name: "Dither Studio",
      type: "app",
      parentId: "root",
      position: getAppPosition(1),
      app: "dither-studio",
    },
    modelViewer: {
      id: "modelViewer",
      name: "Model Viewer",
      type: "app",
      parentId: "root",
      position: getAppPosition(2),
      app: "model-viewer",
    },
    badgeGenerator: {
      id: "badgeGenerator",
      name: "Badge Generator",
      type: "app",
      parentId: "root",
      position: getAppPosition(3),
      app: "badge-generator",
    },
    audioPlayer: {
      id: "audioPlayer",
      name: "Audio Player",
      type: "app",
      parentId: "root",
      position: getAppPosition(4),
      app: "audio-player",
    },
    videoPlayer: {
      id: "videoPlayer",
      name: "Video Player",
      type: "app",
      parentId: "root",
      position: getAppPosition(5),
      app: "video-player",
    },
    spaceInvaders: {
      id: "spaceInvaders",
      name: "Space Invaders",
      type: "app",
      parentId: "root",
      position: getAppPosition(6),
      app: "space-invaders",
    },
    portfolioAssistant: {
      id: "portfolioAssistant",
      name: "Portfolio Assistant",
      type: "app",
      parentId: "root",
      position: getAppPosition(7),
      app: "portfolio-assistant",
    },
    credits: {
      id: "credits",
      name: "Credits",
      type: "file",
      parentId: "root",
      position: getCreditsPosition(savedIconIds.length),
      content: creditsContent,
    },
    [EASTER_EGG_LOG_FILE_ID]: {
      id: EASTER_EGG_LOG_FILE_ID,
      name: "Easter Eggs",
      type: "file",
      parentId: "root",
      position: getEasterEggLogPosition(savedIconIds.length),
      content: "",
      documentStyle: "easter-eggs-log",
    },
    timeMachineHd: {
      id: "timeMachineHd",
      name: "Time Machine HD",
      type: "system",
      parentId: "root",
      position: getTimeMachinePosition(savedIconIds.length),
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

  return Object.fromEntries(
    Object.entries(items).map(([id, item]) => [
      id,
      {
        ...item,
        position:
          item.parentId === "root" && isAutoLayoutRootItemId(id)
            ? item.position
            : (itemPositions[id] ?? item.position),
      },
    ]),
  ) as Record<string, FileSystemItem>;
};

const getCleanPosition = (
  parentId: string | null,
  item: FileSystemItem,
  index: number,
  siblings: FileSystemItem[],
) =>
  parentId === "root"
    ? getCleanRootPosition(item, siblings)
    : {
        x:
          scaleUiValue(WINDOW_GRID.startX) +
          (index % WINDOW_GRID.columns) * scaleUiValue(WINDOW_GRID.stepX),
        y:
          scaleUiValue(WINDOW_GRID.startY) +
          Math.floor(index / WINDOW_GRID.columns) *
            scaleUiValue(WINDOW_GRID.stepY),
      };

interface FileSystemStore {
  items: Record<string, FileSystemItem>;
  itemPositions: Record<string, Position>;
  activeItemId: string | null;
  getChildren: (parentId: string | null) => FileSystemItem[];
  setActive: (id: string) => void;
  removeActive: () => void;
  moveItem: (id: string, position: Position) => void;
  upsertSavedIconItem: (icon: SavedDesktopIcon) => void;
  deleteSavedIconItem: (id: string) => void;
  cleanUpChildren: (parentId: string | null) => void;
  resetLayout: () => void;
  getItemById: (id: string) => FileSystemItem | undefined;
}

const storedPositions = readStoredPositions();

const shouldPersistItemPosition = (item: FileSystemItem) =>
  item.parentId !== "root" || !isAutoLayoutRootItemId(item.id);

export const useFileSystem = create<FileSystemStore>()(
  persist(
    (set, get) => ({
      items: createInitialItems(storedPositions),
      itemPositions: storedPositions,
      activeItemId: null,
      getChildren: (parentId) => getChildItems(get().items, parentId),

      getItemById: (id: string) => get().items[id],

      setActive: (id: string) => {
        set((state) =>
          state.activeItemId === id ? state : { activeItemId: id },
        );
      },
      removeActive: () => {
        set((state) =>
          state.activeItemId === null ? state : { activeItemId: null },
        );
      },
      moveItem: (id, position) => {
        set((state) => {
          const item = state.items[id];

          if (!item) return state;
          if (
            item.position?.x === position.x &&
            item.position?.y === position.y
          ) {
            return state;
          }

          const shouldPersistPosition = shouldPersistItemPosition(item);
          const positionsWithoutItem = { ...state.itemPositions };
          delete positionsWithoutItem[id];

          return {
            items: {
              ...state.items,
              [id]: {
                ...item,
                position,
              },
            },
            itemPositions: shouldPersistPosition
              ? {
                  ...state.itemPositions,
                  [id]: position,
                }
              : positionsWithoutItem,
          };
        });
      },
      upsertSavedIconItem: (icon) => {
        set((state) => {
          const itemId = savedIconItemId(icon.id);
          const root = state.items.root;
          if (root?.type !== "folder") return state;

          const currentGeneratedFileIds = root.children.filter((childId) =>
            isGeneratedFileItemId(childId),
          );
          const generatedFileIds = currentGeneratedFileIds.includes(itemId)
            ? currentGeneratedFileIds
            : [...currentGeneratedFileIds, itemId];
          const generatedFileIndex = generatedFileIds.indexOf(itemId);
          const existingItem = state.items[itemId];
          const position =
            existingItem?.position ??
            state.itemPositions[itemId] ??
            getSavedIconPosition(generatedFileIndex);
          const credits = state.items.credits;

          return {
            items: {
              ...state.items,
              root: {
                ...root,
                children: getRootChildren(
                  generatedFileIds,
                  getExtraRootItemIds(root.children),
                ),
              },
              ...(credits
                ? {
                    credits: {
                      ...credits,
                      position: getCreditsPosition(generatedFileIds.length),
                    },
                  }
                : {}),
              [itemId]: {
                id: itemId,
                name: icon.name,
                type: "app",
                parentId: "root",
                position,
                app: "icon-painter",
                savedIconId: icon.id,
              },
            },
          };
        });
      },
      deleteSavedIconItem: (id) => {
        set((state) => {
          const item = state.items[id];
          const root = state.items.root;

          if (
            item?.type !== "app" ||
            !item.savedIconId ||
            root?.type !== "folder"
          ) {
            return state;
          }

          deleteSavedIcon(item.savedIconId);

          const nextItems = { ...state.items };
          const nextPositions = { ...state.itemPositions };
          delete nextItems[id];
          delete nextPositions[id];
          const generatedFileIds = root.children.filter(
            (childId) => isGeneratedFileItemId(childId) && childId !== id,
          );
          const credits = nextItems.credits;

          return {
            items: {
              ...nextItems,
              root: {
                ...root,
                children: getRootChildren(
                  generatedFileIds,
                  getExtraRootItemIds(root.children),
                ),
              },
              ...(credits
                ? {
                    credits: {
                      ...credits,
                      position: getCreditsPosition(generatedFileIds.length),
                    },
                  }
                : {}),
            },
            itemPositions: nextPositions,
            activeItemId: state.activeItemId === id ? null : state.activeItemId,
          };
        });
      },
      cleanUpChildren: (parentId) => {
        set((state) => {
          const children = getChildItems(state.items, parentId);
          let nextItems = state.items;
          let nextPositions = state.itemPositions;
          let hasChanges = false;

          children.forEach((item, index) => {
            const position = getCleanPosition(parentId, item, index, children);

            if (
              item.position?.x === position.x &&
              item.position?.y === position.y
            ) {
              return;
            }

            if (!hasChanges) {
              nextItems = { ...state.items };
              nextPositions = { ...state.itemPositions };
              hasChanges = true;
            }

            nextItems[item.id] = {
              ...item,
              position,
            };

            if (shouldPersistItemPosition(item)) {
              nextPositions[item.id] = position;
            } else {
              delete nextPositions[item.id];
            }
          });

          return hasChanges
            ? { items: nextItems, itemPositions: nextPositions }
            : state;
        });
      },
      resetLayout: () => {
        set(() => ({
          items: createInitialItems(),
          itemPositions: {},
          activeItemId: null,
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => createThrottledLocalStorage()),
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<FileSystemStore> | undefined;
        const itemPositions = version < 2 ? {} : (state?.itemPositions ?? {});

        return {
          itemPositions: sanitizeStoredPositions(itemPositions, version),
        } as Partial<FileSystemStore>;
      },
      partialize: (state) => ({ itemPositions: state.itemPositions }),
    },
  ),
);
