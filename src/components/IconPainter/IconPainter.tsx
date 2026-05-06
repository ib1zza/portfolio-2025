import clsx from "clsx";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ButtonHTMLAttributes,
  PointerEvent as ReactPointerEvent,
} from "react";

import s from "./IconPainter.module.scss";

type Tool = "pencil" | "eraser" | "fill";
type ExportFormat = "png" | "svg";

const GRID_SIZE = 32;
const PIXEL_COUNT = GRID_SIZE * GRID_SIZE;
const STORAGE_KEY = "portfolio-2025-icon-painter";
const MAX_HISTORY_LENGTH = 50;
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
  if (typeof window === "undefined") return createBlankPixels();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return createBlankPixels();
    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) && parsed.length === PIXEL_COUNT
      ? parsed.map(Boolean)
      : createBlankPixels();
  } catch {
    return createBlankPixels();
  }
};

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
) => {
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return;

  context.imageSmoothingEnabled = false;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000";

  pixels.forEach((pixel, index) => {
    if (!pixel) return;
    context.fillRect(
      (index % GRID_SIZE) * scale,
      Math.floor(index / GRID_SIZE) * scale,
      scale,
      scale,
    );
  });
};

interface MacButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isPressed?: boolean;
  variant?: "regular" | "default";
}

const MacButton = ({
  children,
  className,
  isPressed,
  variant = "regular",
  ...props
}: MacButtonProps) => (
  <button
    className={clsx(
      s.macButton,
      s[variant],
      {
        [s.pressed]: isPressed,
      },
      className,
    )}
    type="button"
    {...props}
  >
    <span className={s.defaultFill} aria-hidden="true" />
    <span className={s.defaultTop} aria-hidden="true" />
    <span className={s.defaultLeft} aria-hidden="true" />
    <span className={s.defaultRight} aria-hidden="true" />
    <span className={s.defaultBottom} aria-hidden="true" />
    <span
      className={clsx(s.defaultCorner, s.defaultCornerTopLeft)}
      aria-hidden="true"
    />
    <span
      className={clsx(s.defaultCorner, s.defaultCornerTopRight)}
      aria-hidden="true"
    />
    <span
      className={clsx(s.defaultCorner, s.defaultCornerBottomLeft)}
      aria-hidden="true"
    />
    <span
      className={clsx(s.defaultCorner, s.defaultCornerBottomRight)}
      aria-hidden="true"
    />
    <span className={s.buttonFill} aria-hidden="true" />
    <span className={s.buttonTop} aria-hidden="true" />
    <span className={s.buttonLeft} aria-hidden="true" />
    <span className={s.buttonRight} aria-hidden="true" />
    <span className={s.buttonBottom} aria-hidden="true" />
    <span
      className={clsx(s.buttonCorner, s.cornerTopLeft)}
      aria-hidden="true"
    />
    <span
      className={clsx(s.buttonCorner, s.cornerTopRight)}
      aria-hidden="true"
    />
    <span
      className={clsx(s.buttonCorner, s.cornerBottomLeft)}
      aria-hidden="true"
    />
    <span
      className={clsx(s.buttonCorner, s.cornerBottomRight)}
      aria-hidden="true"
    />
    <span className={s.buttonLabel}>{children}</span>
  </button>
);

interface ExportFormatSelectProps {
  value: ExportFormat;
  onChange: (value: ExportFormat) => void;
}

const ExportFormatSelect = ({ value, onChange }: ExportFormatSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = EXPORT_FORMATS.find(
    (option) => option.value === value,
  );

  const closeMenu = useCallback((event: MouseEvent) => {
    const target = event.target;

    if (target instanceof Element && target.closest("[data-popup-menu-item]")) {
      return;
    }

    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("mouseup", closeMenu);

    return () => {
      document.removeEventListener("mouseup", closeMenu);
    };
  }, [closeMenu, isOpen]);

  return (
    <div
      ref={popupRef}
      className={s.popup}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget;

        if (
          !(nextFocus instanceof Node) ||
          !event.currentTarget.contains(nextFocus)
        ) {
          setIsOpen(false);
        }
      }}
    >
      <span className={s.popupLabel}>Format:</span>
      <div className={s.popupControl}>
        <button
          className={clsx(s.popupSurface, s.popupButton, { [s.open]: isOpen })}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onMouseDown={(event) => {
            event.preventDefault();
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsOpen((current) => !current);
            }
            if (event.key === "Escape") {
              setIsOpen(false);
            }
          }}
        >
          <span className={s.popupValue}>{selectedOption?.label}</span>
          <span className={s.popupCaret} aria-hidden="true" />
        </button>

        {isOpen && (
          <div className={clsx(s.popupSurface, s.popupMenu)} role="listbox">
            {EXPORT_FORMATS.map((option) => (
              <button
                key={option.value}
                className={s.popupItem}
                data-popup-menu-item
                type="button"
                role="option"
                aria-selected={option.value === value}
                onMouseUp={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className={s.menuCheck} aria-hidden="true" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const IconPainter = memo(function IconPainter() {
  const [tool, setTool] = useState<Tool>("pencil");
  const [pixels, setPixels] = useState(readStoredPixels);
  const [undoStack, setUndoStack] = useState<boolean[][]>([]);
  const [redoStack, setRedoStack] = useState<boolean[][]>([]);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const pixelsRef = useRef(pixels);
  const isDrawingRef = useRef(false);
  const lastPaintedIndexRef = useRef<number | null>(null);
  const strokeStartPixelsRef = useRef<boolean[] | null>(null);
  const stateFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement | null>(null);

  const filledCount = useMemo(
    () => pixels.reduce((count, pixel) => count + Number(pixel), 0),
    [pixels],
  );

  useEffect(() => {
    pixelsRef.current = pixels;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pixels));
    drawPixels(canvasRef.current, pixels, 8);
    drawPixels(previewRef.current, pixels);
  }, [pixels]);

  useEffect(
    () => () => {
      if (stateFrameRef.current !== null) {
        window.cancelAnimationFrame(stateFrameRef.current);
      }
    },
    [],
  );

  const syncPixelsState = () => {
    if (stateFrameRef.current !== null) return;

    stateFrameRef.current = window.requestAnimationFrame(() => {
      stateFrameRef.current = null;
      setPixels(pixelsRef.current);
    });
  };

  const pushHistory = (previousPixels: boolean[], nextPixels: boolean[]) => {
    if (arePixelsEqual(previousPixels, nextPixels)) return;

    setUndoStack((currentStack) => [
      ...currentStack.slice(-(MAX_HISTORY_LENGTH - 1)),
      previousPixels,
    ]);
    setRedoStack([]);
  };

  const updatePixels = (updater: (currentPixels: boolean[]) => boolean[]) => {
    const nextPixels = updater(pixelsRef.current);
    if (nextPixels === pixelsRef.current) return;

    pixelsRef.current = nextPixels;
    drawPixels(canvasRef.current, nextPixels, 8);
    drawPixels(previewRef.current, nextPixels);
    syncPixelsState();
  };

  const commitPixels = (updater: (currentPixels: boolean[]) => boolean[]) => {
    const previousPixels = pixelsRef.current;
    const nextPixels = updater(previousPixels);

    if (arePixelsEqual(previousPixels, nextPixels)) return;

    pixelsRef.current = nextPixels;
    drawPixels(canvasRef.current, nextPixels, 8);
    drawPixels(previewRef.current, nextPixels);
    setPixels(nextPixels);
    pushHistory(previousPixels, nextPixels);
  };

  const applyTool = (index: number | null) => {
    if (index === null || index < 0 || index >= PIXEL_COUNT) return;

    const previousIndex = lastPaintedIndexRef.current;

    updatePixels((currentPixels) =>
      previousIndex === null || tool === "fill"
        ? paintPixel(currentPixels, index, tool)
        : paintLine(currentPixels, previousIndex, index, tool),
    );
    lastPaintedIndexRef.current = index;
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    lastPaintedIndexRef.current = null;
    strokeStartPixelsRef.current = pixelsRef.current;
    applyTool(getIndexFromEvent(event));
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current || tool === "fill") return;
    applyTool(getIndexFromEvent(event));
  };

  const stopDrawing = () => {
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
  };

  const exportPng = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    drawPixels(canvas, pixels, 16);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "icon-painter.png";
    link.click();
  };

  const exportSvg = () => {
    const rects = pixels
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
  };

  const exportCurrent = () => {
    if (exportFormat === "png") {
      exportPng();
      return;
    }

    exportSvg();
  };

  const undo = () => {
    const previousPixels = undoStack.at(-1);
    if (!previousPixels) return;

    setUndoStack((currentStack) => currentStack.slice(0, -1));
    setRedoStack((currentStack) => [
      ...currentStack.slice(-(MAX_HISTORY_LENGTH - 1)),
      pixelsRef.current,
    ]);
    pixelsRef.current = previousPixels;
    drawPixels(canvasRef.current, previousPixels, 8);
    drawPixels(previewRef.current, previousPixels);
    setPixels(previousPixels);
  };

  const redo = () => {
    const nextPixels = redoStack.at(-1);
    if (!nextPixels) return;

    setRedoStack((currentStack) => currentStack.slice(0, -1));
    setUndoStack((currentStack) => [
      ...currentStack.slice(-(MAX_HISTORY_LENGTH - 1)),
      pixelsRef.current,
    ]);
    pixelsRef.current = nextPixels;
    drawPixels(canvasRef.current, nextPixels, 8);
    drawPixels(previewRef.current, nextPixels);
    setPixels(nextPixels);
  };

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
      </div>

      <div className={s.toolsPanel}>
        <div className={s.title}>Icon Painter</div>
        <div className={s.section}>
          {(["pencil", "eraser", "fill"] as const).map((item) => (
            <MacButton
              key={item}
              isPressed={tool === item}
              onClick={() => setTool(item)}
            >
              {item}
            </MacButton>
          ))}
        </div>
        <div className={s.section}>
          <MacButton onClick={undo} disabled={!undoStack.length}>
            undo
          </MacButton>
          <MacButton onClick={redo} disabled={!redoStack.length}>
            redo
          </MacButton>
          <MacButton
            isPressed={isGridVisible}
            onClick={() => setIsGridVisible((isVisible) => !isVisible)}
          >
            grid
          </MacButton>
        </div>
        <div className={s.section}>
          <MacButton onClick={() => commitPixels(() => createBlankPixels())}>
            clear
          </MacButton>
          <MacButton
            onClick={() =>
              commitPixels((current) => current.map((pixel) => !pixel))
            }
          >
            invert
          </MacButton>
        </div>
        <div className={s.exportRow}>
          <ExportFormatSelect value={exportFormat} onChange={setExportFormat} />
          <MacButton variant="default" onClick={exportCurrent}>
            export
          </MacButton>
        </div>
        <div className={s.previewWrap}>
          <canvas
            ref={previewRef}
            className={s.preview}
            width={GRID_SIZE}
            height={GRID_SIZE}
          />
          <div className={s.meta}>
            <span>32 x 32 pixels</span>
            <span>{filledCount} pixels on</span>
            <span>auto saved</span>
          </div>
        </div>
      </div>
    </div>
  );
});
