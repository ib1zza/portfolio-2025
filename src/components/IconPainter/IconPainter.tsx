import clsx from "clsx";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { MacPromptDialog } from "../UIKit";
import { useFileSystem } from "../../store/useFileSystem";
import { useMenuStore } from "../../store/useMenuStore";
import { useWindowManager } from "../../store/useWindowManager";
import { writeVersionedStorage } from "../../utils/storage";
import { readSavedIcon, saveIconToDesktop } from "./iconPainterDesktop";
import s from "./IconPainter.module.scss";

import type { Tool, ExportFormat, SaveMode, PreviewSize, IconPainterProps } from "./types";
import {
  GRID_SIZE,
  PIXEL_COUNT,
  STORAGE_KEY,
  STORAGE_VERSION,
  MAX_HISTORY_LENGTH,
  PREVIEW_SIZES,
} from "./constants";
import {
  readInitialPixels,
  getIndexFromEvent,
  paintPixel,
  paintLine,
  downloadTextFile,
  drawPixels,
  arePixelsEqual,
  createBlankPixels,
} from "./helpers";
import {
  ToolControls,
  EditControls,
  ExportControls,
  PreviewCanvases,
} from "./IconPainterComponents";

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
