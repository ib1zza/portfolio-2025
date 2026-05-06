import { memo, useCallback, useEffect, useRef, useState } from "react";

import { MacButton } from "../UIKit/MacButton";
import { MacProgress } from "../UIKit/MacProgress";
import { PopupSelect } from "../UIKit/PopupSelect";
import s from "./DitherStudio.module.scss";

type DitherMode = "threshold" | "bayer";
type OutputSize = "128" | "256" | "512";

const MODES: Array<{ value: DitherMode; label: string }> = [
  { value: "threshold", label: "threshold" },
  { value: "bayer", label: "bayer" },
];

const OUTPUT_SIZES: Array<{ value: OutputSize; label: string }> = [
  { value: "128", label: "128 px" },
  { value: "256", label: "256 px" },
  { value: "512", label: "512 px" },
];

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const drawDitheredImage = (
  canvas: HTMLCanvasElement | null,
  image: HTMLImageElement | null,
  mode: DitherMode,
  threshold: number,
  outputSize: number,
) => {
  const context = canvas?.getContext("2d", { willReadFrequently: true });
  if (!canvas || !context) return;

  canvas.width = outputSize;
  canvas.height = outputSize;
  context.imageSmoothingEnabled = true;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, outputSize, outputSize);

  if (!image) return;

  const scale = Math.min(outputSize / image.width, outputSize / image.height);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const x = Math.floor((outputSize - width) / 2);
  const y = Math.floor((outputSize - height) / 2);

  context.drawImage(image, x, y, width, height);

  const imageData = context.getImageData(0, 0, outputSize, outputSize);
  const { data } = imageData;

  for (let py = 0; py < outputSize; py += 1) {
    for (let px = 0; px < outputSize; px += 1) {
      const index = (py * outputSize + px) * 4;
      const gray = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
      const bayerOffset = mode === "bayer" ? (BAYER_4[py % 4][px % 4] - 7.5) * 8 : 0;
      const isBlack = gray < threshold + bayerOffset;
      const value = isBlack ? 0 : 255;

      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
      data[index + 3] = 255;
    }
  }

  context.putImageData(imageData, 0, 0);
};

export const DitherStudio = memo(function DitherStudio() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("No image");
  const [mode, setMode] = useState<DitherMode>("bayer");
  const [threshold, setThreshold] = useState(128);
  const [outputSize, setOutputSize] = useState<OutputSize>("256");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    drawDitheredImage(canvasRef.current, image, mode, threshold, Number(outputSize));
  }, [image, mode, outputSize, threshold]);

  const loadFile = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    const nextImage = new Image();

    nextImage.onload = () => {
      setImage(nextImage);
      setFileName(file.name);
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

  const clearImage = useCallback(() => {
    setImage(null);
    setFileName("No image");
  }, []);

  const setThresholdFromClientX = useCallback((clientX: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);

    setThreshold(Math.round(ratio * 255));
  }, []);

  const handleThresholdPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setThresholdFromClientX(event.clientX, event.currentTarget);
    },
    [setThresholdFromClientX],
  );

  const handleThresholdPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

      setThresholdFromClientX(event.clientX, event.currentTarget);
    },
    [setThresholdFromClientX],
  );

  const handleThresholdKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setThreshold((current) => Math.max(current - 1, 0));
    }

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setThreshold((current) => Math.min(current + 1, 255));
    }
  }, []);

  return (
    <div className={s.ditherStudio}>
      <section className={s.previewPanel}>
        <canvas
          ref={canvasRef}
          className={s.preview}
          width={Number(outputSize)}
          height={Number(outputSize)}
        />
      </section>

      <section className={s.controlPanel}>
        <div className={s.title}>Dither Studio</div>
        <div className={s.fileRow}>
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

        <div className={s.selects}>
          <PopupSelect label="Mode:" value={mode} options={MODES} onChange={setMode} />
          <PopupSelect
            label="Size:"
            value={outputSize}
            options={OUTPUT_SIZES}
            onChange={setOutputSize}
          />
        </div>

        <label className={s.sliderLabel}>
          <span>Threshold:</span>
          <MacProgress
            className={s.thresholdProgress}
            role="slider"
            tabIndex={0}
            aria-label="Threshold"
            value={threshold}
            max={255}
            onPointerDown={handleThresholdPointerDown}
            onPointerMove={handleThresholdPointerMove}
            onKeyDown={handleThresholdKeyDown}
          />
          <span>{threshold}</span>
        </label>

        <div className={s.actions}>
          <MacButton variant="default" onClick={exportPng} disabled={!image}>
            export
          </MacButton>
        </div>

        <div className={s.meta}>
          <span>{fileName}</span>
          <span>1-bit black / white</span>
          <span>{outputSize} x {outputSize} pixels</span>
        </div>
      </section>
    </div>
  );
});
