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
}

export interface LinkItem extends BaseItem {
  type: "link";
  href: string;
  icon: "vk" | "telegram" | "email" | "github";
}

export interface AppItem extends BaseItem {
  type: "app";
  app: "icon-painter" | "dither-studio" | "model-viewer" | "badge-generator";
  savedIconId?: string;
}

export type FileSystemItem = FolderItem | FileItem | LinkItem | AppItem;

export const getChildItems = (
  items: Record<string, FileSystemItem>,
  parentId: string | null,
) => {
  const parent = parentId ? items[parentId] : undefined;

  if (parent?.type === "folder") {
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
const savedIconItemId = (iconId: string) => `saved-icon-${iconId}`;
const MOBILE_LAYOUT_BREAKPOINT = 768;
const FALLBACK_VIEWPORT_WIDTH = 1280;
const MIN_VIEWPORT_WIDTH = 320;
const SAVED_ICON_START_INDEX = 10;
const DESKTOP_GRID = {
  startX: 72,
  startY: 132,
  stepX: 104,
  stepY: 70,
} as const;
const MOBILE_GRID = {
  startX: 12,
  startY: 36,
  stepX: 84,
  stepY: 58,
} as const;
const WINDOW_GRID = {
  columns: 3,
  startX: 16,
  startY: 14,
  stepX: 112,
  stepY: 58,
} as const;

const getDesktopGridPosition = (index: number) => {
  const viewportWidth =
    typeof window === "undefined"
      ? FALLBACK_VIEWPORT_WIDTH
      : Math.max(MIN_VIEWPORT_WIDTH, window.innerWidth);
  const isMobileGrid = viewportWidth < MOBILE_LAYOUT_BREAKPOINT;
  const grid = isMobileGrid ? MOBILE_GRID : DESKTOP_GRID;
  const startX = isMobileGrid ? grid.startX : scaleUiValue(grid.startX);
  const startY = isMobileGrid ? grid.startY : scaleUiValue(grid.startY);
  const stepX = isMobileGrid ? grid.stepX : scaleUiValue(grid.stepX);
  const stepY = isMobileGrid ? grid.stepY : scaleUiValue(grid.stepY);
  const columns = Math.max(1, Math.floor((viewportWidth - startX * 2) / stepX));

  return {
    x: startX + (index % columns) * stepX,
    y: startY + Math.floor(index / columns) * stepY,
  };
};

const getSavedIconPosition = (index: number) =>
  getDesktopGridPosition(SAVED_ICON_START_INDEX + index);

const readStoredPositions = () => {
  if (typeof window === "undefined") return {};

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    return JSON.parse(stored).state?.itemPositions ?? {};
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
      children: [
        "about",
        "projects",
        "education",
        "contact",
        "iconPainter",
        "ditherStudio",
        "modelViewer",
        "badgeGenerator",
        "credits",
        ...savedIconIds,
        "trash",
      ],
    },
    projects: {
      id: "projects",
      name: "Projects",
      type: "folder",
      parentId: "root",
      position: getDesktopGridPosition(1),
      children: portfolio.projectSections.map(
        (section) => `project-section-${section.id}`,
      ),
    },
    about: {
      id: "about",
      name: "About Me",
      type: "folder",
      parentId: "root",
      position: getDesktopGridPosition(0),
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
      position: getDesktopGridPosition(2),
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
      position: getDesktopGridPosition(3),
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
      position: getDesktopGridPosition(4),
      app: "icon-painter",
    },
    ditherStudio: {
      id: "ditherStudio",
      name: "Dither Studio",
      type: "app",
      parentId: "root",
      position: getDesktopGridPosition(5),
      app: "dither-studio",
    },
    modelViewer: {
      id: "modelViewer",
      name: "Model Viewer",
      type: "app",
      parentId: "root",
      position: getDesktopGridPosition(6),
      app: "model-viewer",
    },
    badgeGenerator: {
      id: "badgeGenerator",
      name: "Badge Generator",
      type: "app",
      parentId: "root",
      position: getDesktopGridPosition(7),
      app: "badge-generator",
    },
    credits: {
      id: "credits",
      name: "Credits",
      type: "file",
      parentId: "root",
      position: getDesktopGridPosition(8),
      content: creditsContent,
    },
    trash: {
      id: "trash",
      name: "Trash",
      type: "folder",
      parentId: "root",
      position: getDesktopGridPosition(9),
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
      { ...item, position: itemPositions[id] ?? item.position },
    ]),
  ) as Record<string, FileSystemItem>;
};

const getCleanPosition = (parentId: string | null, index: number) =>
  parentId === "root"
    ? getDesktopGridPosition(index)
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

          return {
            items: {
              ...state.items,
              [id]: {
                ...item,
                position,
              },
            },
            itemPositions: {
              ...state.itemPositions,
              [id]: position,
            },
          };
        });
      },
      upsertSavedIconItem: (icon) => {
        set((state) => {
          const itemId = savedIconItemId(icon.id);
          const root = state.items.root;
          if (root?.type !== "folder") return state;

          const savedIconCount = root.children.filter((childId) =>
            childId.startsWith("saved-icon-"),
          ).length;
          const existingItem = state.items[itemId];
          const position =
            existingItem?.position ??
            state.itemPositions[itemId] ??
            getSavedIconPosition(savedIconCount);
          const children = root.children.includes(itemId)
            ? root.children
            : [
                ...root.children.filter((childId) => childId !== "trash"),
                itemId,
                "trash",
              ];

          return {
            items: {
              ...state.items,
              root: {
                ...root,
                children,
              },
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

          if (item?.type !== "app" || !item.savedIconId || root?.type !== "folder") {
            return state;
          }

          deleteSavedIcon(item.savedIconId);

          const { [id]: _removed, ...nextItems } = state.items;
          const { [id]: _removedPosition, ...nextPositions } =
            state.itemPositions;

          return {
            items: {
              ...nextItems,
              root: {
                ...root,
                children: root.children.filter((childId) => childId !== id),
              },
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
            const position = getCleanPosition(parentId, index);

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
            nextPositions[item.id] = position;
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
      version: 2,
      storage: createJSONStorage(() => createThrottledLocalStorage()),
      migrate: (persistedState, version) => {
        const state = persistedState as Partial<FileSystemStore> | undefined;

        if (version < 2) {
          return { itemPositions: {} } as Partial<FileSystemStore>;
        }

        return {
          itemPositions: state?.itemPositions ?? {},
        } as Partial<FileSystemStore>;
      },
      partialize: (state) => ({ itemPositions: state.itemPositions }),
    },
  ),
);
