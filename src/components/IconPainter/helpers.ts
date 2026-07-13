import type { PointerEvent as ReactPointerEvent } from "react";
import type { Tool } from "./types";
import { GRID_SIZE, PIXEL_COUNT, STORAGE_KEY, STORAGE_VERSION } from "./constants";
import { readVersionedStorage } from "../../utils/storage";
import { readSavedIcon } from "./iconPainterDesktop";

export const createBlankPixels = () => Array<boolean>(PIXEL_COUNT).fill(false);

export const arePixelsEqual = (a: boolean[], b: boolean[]) =>
  a.length === b.length && a.every((pixel, index) => pixel === b[index]);

export const getLineIndexes = (fromIndex: number, toIndex: number) => {
  const indexes: number[] = [];
  let x = fromIndex % GRID_SIZE;
  let y = Math.floor(fromIndex / GRID_SIZE);
  const targetX = toIndex % GRID_SIZE;
  const targetY = Math.floor(toIndex / GRID_SIZE);
  const dx = Math.abs(targetX - x);
  const dy = Math.abs(targetY - y);
  const sx = x < targetX ? 1 : -1;
  const sy = y < targetY ? 1 : -1;
  let error = dx - dy;

  while (true) {
    indexes.push(y * GRID_SIZE + x);

    if (x === targetX && y === targetY) break;

    const doubledError = error * 2;

    if (doubledError > -dy) {
      error -= dy;
      x += sx;
    }
    if (doubledError < dx) {
      error += dx;
      y += sy;
    }
  }

  return indexes;
};

export const readStoredPixels = () => {
  return readVersionedStorage(
    STORAGE_KEY,
    STORAGE_VERSION,
    createBlankPixels(),
    (stored) =>
      Array.isArray(stored) && stored.length === PIXEL_COUNT
        ? stored.map(Boolean)
        : createBlankPixels(),
  );
};

export const readInitialPixels = (savedIconId: string | undefined) =>
  savedIconId
    ? (readSavedIcon(savedIconId)?.pixels ?? createBlankPixels())
    : readStoredPixels();

export const getIndexFromEvent = (event: ReactPointerEvent<HTMLDivElement>) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.floor(((event.clientX - rect.left) / rect.width) * GRID_SIZE);
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * GRID_SIZE);

  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null;

  return y * GRID_SIZE + x;
};

export const floodFill = (pixels: boolean[], startIndex: number, value: boolean) => {
  const source = pixels[startIndex];
  if (source === value) return pixels;

  const nextPixels = [...pixels];
  const stack = [startIndex];

  while (stack.length) {
    const index = stack.pop();
    if (index === undefined || nextPixels[index] !== source) continue;

    nextPixels[index] = value;

    const x = index % GRID_SIZE;
    const y = Math.floor(index / GRID_SIZE);

    if (x > 0) stack.push(index - 1);
    if (x < GRID_SIZE - 1) stack.push(index + 1);
    if (y > 0) stack.push(index - GRID_SIZE);
    if (y < GRID_SIZE - 1) stack.push(index + GRID_SIZE);
  }

  return nextPixels;
};

export const paintPixel = (pixels: boolean[], index: number, tool: Tool) => {
  if (tool === "fill") return floodFill(pixels, index, true);

  const value = tool === "pencil";
  if (pixels[index] === value) return pixels;

  const nextPixels = [...pixels];
  nextPixels[index] = value;

  return nextPixels;
};

export const paintLine = (
  pixels: boolean[],
  fromIndex: number,
  toIndex: number,
  tool: Tool,
) => {
  const value = tool === "pencil";
  let nextPixels = pixels;

  getLineIndexes(fromIndex, toIndex).forEach((index) => {
    if (nextPixels[index] === value) return;
    if (nextPixels === pixels) nextPixels = [...pixels];

    nextPixels[index] = value;
  });

  return nextPixels;
};

export const downloadTextFile = (filename: string, content: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

export const drawPixels = (
  canvas: HTMLCanvasElement | null,
  pixels: boolean[],
  scale = 1,
  extendPixels = false,
) => {
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return;

  context.imageSmoothingEnabled = false;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000";

  const size = extendPixels ? scale + 1 : scale;

  pixels.forEach((pixel, index) => {
    if (!pixel) return;
    context.fillRect(
      (index % GRID_SIZE) * scale,
      Math.floor(index / GRID_SIZE) * scale,
      size,
      size,
    );
  });
};
