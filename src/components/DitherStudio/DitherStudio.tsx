import { memo, useCallback, useEffect, useRef, useState } from "react";

import { MacButton, MacPromptDialog, MacSlider, PopupSelect } from "../UIKit";
import { drawDitheredImage } from "./ditherCanvas";
import { downloadText, getSvgFromCanvas } from "./ditherExport";
import { saveIconToDesktop } from "../IconPainter/iconPainterDesktop";
import { useFileSystem } from "../../store/useFileSystem";
import {
  DITHER_MODES,
  EXPORT_FORMATS,
  OUTPUT_SIZES,
  type DitherMode,
  type ExportFormat,
  type OutputSize,
} from "./ditherTypes";
import s from "./DitherStudio.module.scss";

export const DitherStudio = memo(function DitherStudio() {
  const upsertSavedIconItem = useFileSystem(
    (state) => state.upsertSavedIconItem,
  );
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("No image");
  void fileName;
  const [mode, setMode] = useState<DitherMode>("bayer");
  const [threshold, setThreshold] = useState(128);
  const [contrast, setContrast] = useState(0);
  const [invert, setInvert] = useState(false);
  const [outputSize, setOutputSize] = useState<OutputSize>("256");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [isSaveIconDialogOpen, setIsSaveIconDialogOpen] = useState(false);
  const [status, setStatus] = useState("ready");
  void status;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    drawDitheredImage(
      canvasRef.current,
      image,
      mode,
      threshold,
      contrast,
      invert,
      Number(outputSize),
    );
  }, [contrast, image, invert, mode, outputSize, threshold]);

  const loadFile = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    const nextImage = new Image();

    nextImage.onload = () => {
      setImage(nextImage);
      setFileName(file.name);
      setStatus("image loaded");
      URL.revokeObjectURL(url);
    };
    nextImage.src = url;
  }, []);

  const exportPng = useCallback(() => {
    const link = document.createElement("a");

    link.href = canvasRef.current?.toDataURL("image/png") ?? "";
    link.download = "dither-studio.png";
    link.click();
  }, []);

  const exportSvg = useCallback(() => {
    const svg = getSvgFromCanvas(canvasRef.current);
    if (!svg) return;

    downloadText(svg, "dither-studio.svg", "image/svg+xml");
  }, []);

  const exportCurrent = useCallback(() => {
    if (exportFormat === "png") {
      exportPng();
      return;
    }

    exportSvg();
  }, [exportFormat, exportPng, exportSvg]);

  const copyCurrent = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.clipboard) return;

    if (exportFormat === "svg") {
      const svg = getSvgFromCanvas(canvas);
      if (!svg) return;

      await navigator.clipboard.writeText(svg);
      setStatus("copied svg");
      return;
    }

    if (!window.ClipboardItem) return;

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!blob) return;

    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    setStatus("copied png");
  }, [exportFormat]);

  const saveIcon = useCallback(
    (name: string) => {
      if (!image) return;

      if (!name?.trim()) return;

      const iconCanvas = document.createElement("canvas");
      drawDitheredImage(
        iconCanvas,
        image,
        mode,
        threshold,
        contrast,
        invert,
        32,
      );

      const context = iconCanvas.getContext("2d");
      if (!context) return;

      const { data } = context.getImageData(0, 0, 32, 32);
      const pixels = Array.from({ length: 32 * 32 }, (_, index) => {
        const dataIndex = index * 4;

        return data[dataIndex] < 128;
      });
      const savedIcon = saveIconToDesktop({ name, pixels });

      upsertSavedIconItem(savedIcon);
      setIsSaveIconDialogOpen(false);
      setStatus("saved 32 px icon");
    },
    [contrast, image, invert, mode, threshold, upsertSavedIconItem],
  );

  const clearImage = useCallback(() => {
    setImage(null);
    setFileName("No image");
    setStatus("ready");
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      loadFile(event.dataTransfer.files[0]);
    },
    [loadFile],
  );

  return (
    <div className={s.ditherStudio}>
      <section className={s.importPanel}>
        <div className={s.previewPanel}>
          <div
            className={s.dropTarget}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          />
          <canvas
            ref={canvasRef}
            className={s.preview}
            width={Number(outputSize)}
            height={Number(outputSize)}
          />
        </div>

        <div className={s.importControls}>
          <input
            ref={inputRef}
            className={s.fileInput}
            type="file"
            accept="image/*"
            onChange={(event) => loadFile(event.target.files?.[0])}
          />
          <MacButton onClick={() => inputRef.current?.click()}>open</MacButton>
          <MacButton onClick={clearImage} disabled={!image}>
            clear
          </MacButton>
        </div>
      </section>

      <section className={s.controlPanel}>
        <div className={s.title}>Dither Studio</div>
        <div className={s.selects}>
          <PopupSelect
            label="Mode:"
            value={mode}
            options={DITHER_MODES}
            onChange={setMode}
          />
          <PopupSelect
            label="Size:"
            value={outputSize}
            options={OUTPUT_SIZES}
            onChange={setOutputSize}
          />
        </div>

        <label className={s.sliderLabel}>
          <span>Threshold:</span>
          <MacSlider
            className={s.thresholdProgress}
            aria-label="Threshold"
            value={threshold}
            min={0}
            max={255}
            onChange={setThreshold}
          />
          <span>{threshold}</span>
        </label>

        <label className={s.sliderLabel}>
          <span>Contrast:</span>
          <MacSlider
            className={s.thresholdProgress}
            aria-label="Contrast"
            value={contrast}
            min={-100}
            max={100}
            onChange={setContrast}
          />
          <span>{contrast}</span>
        </label>

        <div className={s.actions}>
          <MacButton
            isPressed={invert}
            onClick={() => setInvert((value) => !value)}
          >
            invert
          </MacButton>
        </div>

        <div className={s.exportSection}>
          <div className={s.separator} />
          <div className={s.exportTitle}>Export</div>
          <div className={s.exportRow}>
            <PopupSelect
              label="Format:"
              value={exportFormat}
              options={EXPORT_FORMATS}
              onChange={setExportFormat}
            />
            <MacButton
              variant="default"
              onClick={exportCurrent}
              disabled={!image}
            >
              export
            </MacButton>
            <MacButton onClick={copyCurrent} disabled={!image}>
              copy
            </MacButton>
            <MacButton
              onClick={() => setIsSaveIconDialogOpen(true)}
              disabled={!image}
            >
              save as icon
            </MacButton>
          </div>
        </div>

        {/* <div className={s.meta}>
          <span>{fileName}</span>
          <span>1-bit black / white</span>
          <span>{mode} mode</span>
          <span>
            {outputSize} x {outputSize} pixels
          </span>
          <span>{status}</span>
        </div> */}
      </section>

      {isSaveIconDialogOpen && (
        <MacPromptDialog
          title="New"
          label="Label"
          initialValue="Dither Icon"
          onCancel={() => setIsSaveIconDialogOpen(false)}
          onConfirm={saveIcon}
        />
      )}
    </div>
  );
});
