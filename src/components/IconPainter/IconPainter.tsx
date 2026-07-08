import clsx from "clsx";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { MacButton, MacPromptDialog, PopupSelect } from "../UIKit";
import { useFileSystem } from "../../store/useFileSystem";
import { useMenuStore } from "../../store/useMenuStore";
import { useWindowManager } from "../../store/useWindowManager";
import {
  readVersionedStorage,
  writeVersionedStorage,
} from "../../utils/storage";
import { readSavedIcon, saveIconToDesktop } from "./iconPainterDesktop";
import s from "./IconPainter.module.scss";

type Tool = "pencil" | "eraser" | "fill";
type ExportFormat = "png" | "svg";
type SaveMode = "overwrite" | "copy";

const GRID_SIZE = 32;
const PIXEL_COUNT = GRID_SIZE * GRID_SIZE;
const STORAGE_KEY = "portfolio-2025-icon-painter";
const STORAGE_VERSION = 1;
const MAX_HISTORY_LENGTH = 50;
const PREVIEW_SIZES = [128, 64, 32] as const;
type PreviewSize = (typeof PREVIEW_SIZES)[number];
const TOOL_OPTIONS: Tool[] = ["pencil", "eraser", "fill"];
const EXPORT_FORMATS: Array<{ value: ExportFormat; label: string }> = [
  { value: "png", label: "png" },
  { value: "svg", label: "svg" },
];

const createBlankPixels = () => Array<boolean>(PIXEL_COUNT).fill(false);

const arePixelsEqual = (a: boolean[], b: boolean[]) =>
  a.length === b.length && a.every((pixel, index) => pixel === b[index]);

const getLineIndexes = (fromIndex: number, toIndex: number) => {
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

const readStoredPixels = () => {
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

const readInitialPixels = (savedIconId: string | undefined) =>
  savedIconId
    ? (readSavedIcon(savedIconId)?.pixels ?? createBlankPixels())
    : readStoredPixels();

const getIndexFromEvent = (event: ReactPointerEvent<HTMLDivElement>) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.floor(((event.clientX - rect.left) / rect.width) * GRID_SIZE);
  const y = Math.floor(((event.clientY - rect.top) / rect.height) * GRID_SIZE);

  if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null;

  return y * GRID_SIZE + x;
};

const floodFill = (pixels: boolean[], startIndex: number, value: boolean) => {
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

const paintPixel = (pixels: boolean[], index: number, tool: Tool) => {
  if (tool === "fill") return floodFill(pixels, index, true);

  const value = tool === "pencil";
  if (pixels[index] === value) return pixels;

  const nextPixels = [...pixels];
  nextPixels[index] = value;

  return nextPixels;
};

const paintLine = (
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

const downloadTextFile = (filename: string, content: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

const drawPixels = (
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

const ToolControls = memo(function ToolControls({
  tool,
  onToolChange,
}: {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
}) {
  return (
    <div className={s.section}>
      {TOOL_OPTIONS.map((item) => (
        <MacButton
          key={item}
          isPressed={tool === item}
          onClick={() => onToolChange(item)}
        >
          {item}
        </MacButton>
      ))}
    </div>
  );
});

const EditControls = memo(function EditControls({
  canUndo,
  canRedo,
  isGridVisible,
  onUndo,
  onRedo,
  onToggleGrid,
  onClear,
  onInvert,
}: {
  canUndo: boolean;
  canRedo: boolean;
  isGridVisible: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleGrid: () => void;
  onClear: () => void;
  onInvert: () => void;
}) {
  return (
    <>
      <div className={s.section}>
        <MacButton onClick={onUndo} disabled={!canUndo}>
          undo
        </MacButton>
        <MacButton onClick={onRedo} disabled={!canRedo}>
          redo
        </MacButton>
        <MacButton isPressed={isGridVisible} onClick={onToggleGrid}>
          grid
        </MacButton>
      </div>
      <div className={s.section}>
        <MacButton onClick={onClear}>clear</MacButton>
        <MacButton onClick={onInvert}>invert</MacButton>
      </div>
    </>
  );
});

const ExportControls = memo(function ExportControls({
  exportFormat,
  onExportFormatChange,
  onExport,
  onSave,
  onSaveAs,
  savedIconId,
}: {
  exportFormat: ExportFormat;
  onExportFormatChange: (format: ExportFormat) => void;
  onExport: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  savedIconId?: string;
}) {
  return (
    <div className={s.exportRow}>
      <PopupSelect
        label="Format:"
        value={exportFormat}
        options={EXPORT_FORMATS}
        onChange={onExportFormatChange}
      />
      <MacButton variant="default" onClick={onExport}>
        export
      </MacButton>
      <MacButton onClick={onSave}>
        {savedIconId ? "save" : "save desktop"}
      </MacButton>
      <MacButton onClick={onSaveAs}>save as</MacButton>
    </div>
  );
});

const PreviewCanvases = memo(function PreviewCanvases({
  setPreviewRef,
}: {
  setPreviewRef: (size: PreviewSize, element: HTMLCanvasElement | null) => void;
}) {
  return (
    <div className={s.previewWrap}>
      <div className={s.previews}>
        {PREVIEW_SIZES.map((size) => (
          <div key={size} className={s.previewItem}>
            <canvas
              ref={(element) => setPreviewRef(size, element)}
              className={s.preview}
              style={{ width: size, height: size }}
              width={size}
              height={size}
            />
            <span>{size}px</span>
          </div>
        ))}
      </div>
    </div>
  );
});

interface IconPainterProps {
  savedIconId?: string;
  savedIconName?: string;
  windowId?: string;
}

export const IconPainter = memo(function IconPainter({
  savedIconId,
  savedIconName,
  windowId,
}: IconPainterProps) {
  const upsertSavedIconItem = useFileSystem(
    (state) => state.upsertSavedIconItem,
  );
  const isFocused = useWindowManager(
    (state) => state.focusedWindowId === windowId,
  );
  const setAppMenu = useMenuStore((state) => state.setAppMenu);
  const clearAppMenu = useMenuStore((state) => state.clearAppMenu);
  const [tool, setTool] = useState<Tool>("pencil");
  const [pixels, setPixels] = useState(() => readInitialPixels(savedIconId));
  const [undoStack, setUndoStack] = useState<boolean[][]>([]);
  const [redoStack, setRedoStack] = useState<boolean[][]>([]);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [pendingSaveMode, setPendingSaveMode] = useState<SaveMode | null>(null);
  const loadedSavedIconIdRef = useRef(savedIconId);
  const pixelsRef = useRef(pixels);
  const isDrawingRef = useRef(false);
  const lastPaintedIndexRef = useRef<number | null>(null);
  const strokeStartPixelsRef = useRef<boolean[] | null>(null);
  const stateFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRefs = useRef<Record<number, HTMLCanvasElement | null>>({});

  const drawAllPixels = useCallback((nextPixels: boolean[]) => {
    drawPixels(canvasRef.current, nextPixels, 8, true);
    PREVIEW_SIZES.forEach((size) => {
      drawPixels(
        previewRefs.current[size],
        nextPixels,
        size / GRID_SIZE,
        false,
      );
    });
  }, []);

  const setPreviewRef = useCallback(
    (size: PreviewSize, element: HTMLCanvasElement | null) => {
      previewRefs.current[size] = element;
      if (element)
        drawPixels(element, pixelsRef.current, size / GRID_SIZE, false);
    },
    [],
  );

  const filledCount = useMemo(
    () => pixels.reduce((count, pixel) => count + Number(pixel), 0),
    [pixels],
  );

  useEffect(() => {
    pixelsRef.current = pixels;
    if (!savedIconId) {
      writeVersionedStorage(STORAGE_KEY, STORAGE_VERSION, pixels);
    }
    drawAllPixels(pixels);
  }, [drawAllPixels, pixels, savedIconId]);

  useEffect(() => {
    if (loadedSavedIconIdRef.current === savedIconId) return;

    const nextPixels = readInitialPixels(savedIconId);
    loadedSavedIconIdRef.current = savedIconId;
    pixelsRef.current = nextPixels;
    setPixels(nextPixels);
    setUndoStack([]);
    setRedoStack([]);
    drawAllPixels(nextPixels);
  }, [drawAllPixels, savedIconId]);

  useEffect(
    () => () => {
      if (stateFrameRef.current !== null) {
        window.cancelAnimationFrame(stateFrameRef.current);
      }
    },
    [],
  );

  const syncPixelsState = useCallback(() => {
    if (stateFrameRef.current !== null) return;

    stateFrameRef.current = window.requestAnimationFrame(() => {
      stateFrameRef.current = null;
      setPixels(pixelsRef.current);
    });
  }, []);

  const pushHistory = useCallback(
    (previousPixels: boolean[], nextPixels: boolean[]) => {
      if (arePixelsEqual(previousPixels, nextPixels)) return;

      setUndoStack((currentStack) => [
        ...currentStack.slice(-(MAX_HISTORY_LENGTH - 1)),
        previousPixels,
      ]);
      setRedoStack([]);
    },
    [],
  );

  const updatePixels = useCallback(
    (updater: (currentPixels: boolean[]) => boolean[]) => {
      const nextPixels = updater(pixelsRef.current);
      if (nextPixels === pixelsRef.current) return;

      pixelsRef.current = nextPixels;
      drawAllPixels(nextPixels);
      syncPixelsState();
    },
    [drawAllPixels, syncPixelsState],
  );

  const commitPixels = useCallback(
    (updater: (currentPixels: boolean[]) => boolean[]) => {
      const previousPixels = pixelsRef.current;
      const nextPixels = updater(previousPixels);

      if (arePixelsEqual(previousPixels, nextPixels)) return;

      pixelsRef.current = nextPixels;
      drawAllPixels(nextPixels);
      setPixels(nextPixels);
      pushHistory(previousPixels, nextPixels);
    },
    [drawAllPixels, pushHistory],
  );

  const applyTool = useCallback(
    (index: number | null) => {
      if (index === null || index < 0 || index >= PIXEL_COUNT) return;

      const previousIndex = lastPaintedIndexRef.current;

      updatePixels((currentPixels) =>
        previousIndex === null || tool === "fill"
          ? paintPixel(currentPixels, index, tool)
          : paintLine(currentPixels, previousIndex, index, tool),
      );
      lastPaintedIndexRef.current = index;
    },
    [tool, updatePixels],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      isDrawingRef.current = true;
      lastPaintedIndexRef.current = null;
      strokeStartPixelsRef.current = pixelsRef.current;
      applyTool(getIndexFromEvent(event));
    },
    [applyTool],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDrawingRef.current || tool === "fill") return;
      applyTool(getIndexFromEvent(event));
    },
    [applyTool, tool],
  );

  const stopDrawing = useCallback(() => {
    if (strokeStartPixelsRef.current) {
      pushHistory(strokeStartPixelsRef.current, pixelsRef.current);
    }

    if (stateFrameRef.current !== null) {
      window.cancelAnimationFrame(stateFrameRef.current);
      stateFrameRef.current = null;
    }
    setPixels(pixelsRef.current);
    isDrawingRef.current = false;
    lastPaintedIndexRef.current = null;
    strokeStartPixelsRef.current = null;
  }, [pushHistory]);

  const exportPng = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    drawPixels(canvas, pixelsRef.current, 16);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "icon-painter.png";
    link.click();
  }, []);

  const exportSvg = useCallback(() => {
    const rects = pixelsRef.current
      .map((pixel, index) =>
        pixel
          ? `<rect x="${index % GRID_SIZE}" y="${Math.floor(
              index / GRID_SIZE,
            )}" width="1" height="1" fill="black" />`
          : "",
      )
      .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 ${GRID_SIZE} ${GRID_SIZE}" shape-rendering="crispEdges"><rect width="${GRID_SIZE}" height="${GRID_SIZE}" fill="white" />${rects}</svg>`;

    downloadTextFile("icon-painter.svg", svg, "image/svg+xml");
  }, []);

  const exportCurrent = useCallback(() => {
    if (exportFormat === "png") {
      exportPng();
      return;
    }

    exportSvg();
  }, [exportFormat, exportPng, exportSvg]);

  const saveDesktopIcon = useCallback(
    (mode: SaveMode, nextName: string) => {
      const currentIcon = readSavedIcon(savedIconId);
      const shouldOverwrite = mode === "overwrite" && Boolean(currentIcon);

      if (!nextName?.trim()) return;

      const savedIcon = saveIconToDesktop({
        id: shouldOverwrite ? savedIconId : undefined,
        name: nextName,
        pixels: pixelsRef.current,
      });

      upsertSavedIconItem(savedIcon);
    },
    [savedIconId, upsertSavedIconItem],
  );

  const confirmSave = useCallback(
    (nextName: string) => {
      if (!pendingSaveMode) return;

      saveDesktopIcon(pendingSaveMode, nextName);
      setPendingSaveMode(null);
    },
    [pendingSaveMode, saveDesktopIcon],
  );

  const undo = useCallback(() => {
    const previousPixels = undoStack.at(-1);
    if (!previousPixels) return;

    setUndoStack((currentStack) => currentStack.slice(0, -1));
    setRedoStack((currentStack) => [
      ...currentStack.slice(-(MAX_HISTORY_LENGTH - 1)),
      pixelsRef.current,
    ]);
    pixelsRef.current = previousPixels;
    drawAllPixels(previousPixels);
    setPixels(previousPixels);
  }, [drawAllPixels, undoStack]);

  const redo = useCallback(() => {
    const nextPixels = redoStack.at(-1);
    if (!nextPixels) return;

    setRedoStack((currentStack) => currentStack.slice(0, -1));
    setUndoStack((currentStack) => [
      ...currentStack.slice(-(MAX_HISTORY_LENGTH - 1)),
      pixelsRef.current,
    ]);
    pixelsRef.current = nextPixels;
    drawAllPixels(nextPixels);
    setPixels(nextPixels);
  }, [drawAllPixels, redoStack]);

  const toggleGrid = useCallback(() => {
    setIsGridVisible((isVisible) => !isVisible);
  }, []);

  const clearPixels = useCallback(() => {
    commitPixels(() => createBlankPixels());
  }, [commitPixels]);

  const invertPixels = useCallback(() => {
    commitPixels((current) => current.map((pixel) => !pixel));
  }, [commitPixels]);

  useEffect(() => {
    if (!isFocused) return;

    setAppMenu(
      [
        {
          title: "Tools",
          submenu: [
            {
              title: "Pencil",
              action: () => setTool("pencil"),
              checked: tool === "pencil",
            },
            {
              title: "Eraser",
              action: () => setTool("eraser"),
              checked: tool === "eraser",
            },
            {
              title: "Fill",
              action: () => setTool("fill"),
              checked: tool === "fill",
            },
            null,
            {
              title: "Toggle Grid",
              action: toggleGrid,
              checked: isGridVisible,
            },
          ],
        },
        {
          title: "Image",
          submenu: [
            { title: "Clear Canvas", action: clearPixels },
            { title: "Invert Colors", action: invertPixels },
          ],
        },
      ],
      [
        { title: "Save", action: () => setPendingSaveMode("overwrite") },
        { title: "Save As...", action: () => setPendingSaveMode("copy") },
        { title: "Export...", action: exportCurrent },
        null,
      ],
      [
        { title: "Undo", action: undo, disabled: undoStack.length === 0 },
        { title: "Redo", action: redo, disabled: redoStack.length === 0 },
      ],
    );

    return () => clearAppMenu();
  }, [
    isFocused,
    tool,
    isGridVisible,
    setTool,
    toggleGrid,
    clearPixels,
    invertPixels,
    setPendingSaveMode,
    exportCurrent,
    undo,
    redo,
    undoStack.length,
    redoStack.length,
    setAppMenu,
    clearAppMenu,
  ]);

  return (
    <div className={s.iconPainter}>
      <div className={s.canvasPanel}>
        <div
          className={clsx(s.canvas, { [s.grid]: isGridVisible })}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onDragStart={(event) => event.preventDefault()}
        >
          <canvas
            ref={canvasRef}
            className={s.canvasBitmap}
            width={256}
            height={256}
            aria-label="Icon canvas"
          />
        </div>

        <div className={s.meta}>
          <span>32 x 32 pixels</span>
          <span>{filledCount} pixels on</span>
          <span>{savedIconId ? "manual save" : "auto saved draft"}</span>
        </div>
      </div>

      <div className={s.toolsPanel}>
        <div className={s.title}>Icon Painter</div>
        <ToolControls tool={tool} onToolChange={setTool} />
        <EditControls
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          isGridVisible={isGridVisible}
          onUndo={undo}
          onRedo={redo}
          onToggleGrid={toggleGrid}
          onClear={clearPixels}
          onInvert={invertPixels}
        />
        <ExportControls
          exportFormat={exportFormat}
          onExportFormatChange={setExportFormat}
          onExport={exportCurrent}
          onSave={() => setPendingSaveMode("overwrite")}
          onSaveAs={() => setPendingSaveMode("copy")}
          savedIconId={savedIconId}
        />
        <PreviewCanvases setPreviewRef={setPreviewRef} />
      </div>

      {pendingSaveMode && (
        <MacPromptDialog
          title={pendingSaveMode === "copy" ? "New" : "Save"}
          label="Label"
          initialValue={
            pendingSaveMode === "overwrite"
              ? readSavedIcon(savedIconId)?.name ||
                savedIconName ||
                "Badge Icon"
              : savedIconName || "Badge Icon"
          }
          onCancel={() => setPendingSaveMode(null)}
          onConfirm={confirmSave}
        />
      )}
    </div>
  );
});
