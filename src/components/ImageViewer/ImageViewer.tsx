import { memo, useEffect, useRef, useState } from "react";

import { getAssetPath } from "../../utils/assets";
import { drawDitheredImage } from "../DitherStudio/ditherCanvas";
import type { DitherMode, OutputSize } from "../DitherStudio/ditherTypes";
import s from "./ImageViewer.module.scss";

const DEFAULT_MODE: DitherMode = "bayer";
const DEFAULT_THRESHOLD = 128;
const DEFAULT_CONTRAST = 0;
const DEFAULT_INVERT = false;
const DEFAULT_OUTPUT_SIZE: OutputSize = "256";

interface ImageViewerProps {
  windowId: string;
  fileUrl?: string;
}

export const ImageViewer = memo(function ImageViewer({
  windowId,
  fileUrl,
}: ImageViewerProps) {
  void windowId;
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("loading");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!fileUrl) return;

    const url = getAssetPath(fileUrl);
    const img = new Image();

    img.onload = () => {
      setImage(img);
      setFileName(fileUrl.split("/").pop() ?? "image");
      setStatus("loaded");
    };

    img.onerror = () => {
      setStatus("error");
    };

    img.src = url;
  }, [fileUrl]);

  useEffect(() => {
    if (!image) return;
    drawDitheredImage(
      canvasRef.current,
      image,
      DEFAULT_MODE,
      DEFAULT_THRESHOLD,
      DEFAULT_CONTRAST,
      DEFAULT_INVERT,
      Number(DEFAULT_OUTPUT_SIZE),
    );
  }, [image]);

  if (status === "loading") {
    return (
      <div className={s.imageViewer}>
        <div className={s.statusWrap}>
          <span className={s.statusText}>Loading...</span>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={s.imageViewer}>
        <div className={s.statusWrap}>
          <span className={s.statusText}>Failed to load image</span>
        </div>
      </div>
    );
  }

  return (
    <div className={s.imageViewer}>
      <div className={s.previewPanel}>
        <canvas
          ref={canvasRef}
          className={s.preview}
        />
      </div>
      <div className={s.meta}>
        <span>{fileName}</span>
        {image && (
          <span>
            {image.naturalWidth} x {image.naturalHeight} px
          </span>
        )}
      </div>
    </div>
  );
});
