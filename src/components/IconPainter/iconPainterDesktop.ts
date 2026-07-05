import {
  readVersionedStorage,
} from "../../utils/storage";

export const ICON_GRID_SIZE = 32;
const ICON_PIXEL_COUNT = ICON_GRID_SIZE * ICON_GRID_SIZE;
export const ICON_DESKTOP_STORAGE_EVENT = "portfolio-2025-icon-desktop";

const DESKTOP_STORAGE_KEY = "portfolio-2025-icon-painter-desktop";
const DESKTOP_STORAGE_VERSION = 1;
const ICON_LIBRARY_STORAGE_KEY = "portfolio-2025-icon-painter-library";
const ICON_LIBRARY_STORAGE_VERSION = 1;

export interface SavedDesktopIcon {
  id: string;
  name: string;
  pixels: boolean[];
  updatedAt: number;
}

export const createBlankIconPixels = () =>
  Array<boolean>(ICON_PIXEL_COUNT).fill(false);

const normalizePixels = (pixels: unknown) =>
  Array.isArray(pixels) && pixels.length === ICON_PIXEL_COUNT
    ? pixels.map(Boolean)
    : createBlankIconPixels();

const readDesktopIconPixels = () =>
  readVersionedStorage(
    DESKTOP_STORAGE_KEY,
    DESKTOP_STORAGE_VERSION,
    createBlankIconPixels(),
    normalizePixels,
  );

const writeSavedIcons = (icons: SavedDesktopIcon[]) => {
  window.localStorage.setItem(
    ICON_LIBRARY_STORAGE_KEY,
    JSON.stringify({
      version: ICON_LIBRARY_STORAGE_VERSION,
      data: icons,
    }),
  );

  window.dispatchEvent(new Event(ICON_DESKTOP_STORAGE_EVENT));
};

export const readSavedIcons = () => {
  const hasLibraryStorage =
    typeof window !== "undefined" &&
    Boolean(window.localStorage.getItem(ICON_LIBRARY_STORAGE_KEY));
  const icons = readVersionedStorage<SavedDesktopIcon[]>(
    ICON_LIBRARY_STORAGE_KEY,
    ICON_LIBRARY_STORAGE_VERSION,
    [],
    (stored) =>
      Array.isArray(stored)
        ? stored
            .filter((icon) => icon && typeof icon === "object")
            .map((icon) => {
              const item = icon as Partial<SavedDesktopIcon>;

              return {
                id: String(item.id ?? crypto.randomUUID()),
                name: String(item.name ?? "Badge Icon"),
                pixels: normalizePixels(item.pixels),
                updatedAt: Number(item.updatedAt ?? Date.now()),
              };
            })
        : [],
  );

  if (icons.length || hasLibraryStorage) return icons;

  const legacyPixels = readDesktopIconPixels();
  const hasLegacyPixels = legacyPixels.some(Boolean);

  return hasLegacyPixels
    ? [
        {
          id: "legacy-badge-icon",
          name: "Badge Icon",
          pixels: legacyPixels,
          updatedAt: Date.now(),
        },
      ]
    : [];
};

export const readSavedIcon = (id: string | undefined) =>
  id ? readSavedIcons().find((icon) => icon.id === id) : undefined;

export const saveIconToDesktop = ({
  id,
  name,
  pixels,
}: {
  id?: string;
  name: string;
  pixels: boolean[];
}) => {
  const icons = readSavedIcons();
  const savedIcon = {
    id: id ?? crypto.randomUUID(),
    name: name.trim() || "Badge Icon",
    pixels: normalizePixels(pixels),
    updatedAt: Date.now(),
  };
  const nextIcons = id
    ? icons.map((icon) => (icon.id === id ? savedIcon : icon))
    : [...icons, savedIcon];

  writeSavedIcons(id && !icons.some((icon) => icon.id === id)
    ? [...icons, savedIcon]
    : nextIcons);

  return savedIcon;
};

export const deleteSavedIcon = (id: string) => {
  writeSavedIcons(readSavedIcons().filter((icon) => icon.id !== id));
};

export const iconPixelsToRects = (
  pixels: boolean[],
  scale = 1,
  offsetX = 0,
  offsetY = 0,
) =>
  pixels
    .map((pixel, index) =>
      pixel
        ? `<rect x="${offsetX + (index % ICON_GRID_SIZE) * scale}" y="${
            offsetY + Math.floor(index / ICON_GRID_SIZE) * scale
          }" width="${scale}" height="${scale}" fill="black" />`
        : "",
    )
    .join("");
