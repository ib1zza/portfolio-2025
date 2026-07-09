import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { MacButton, MacSlider, PopupSelect } from "../UIKit";
import { getAssetPath } from "../../utils/assets";
import { useThreeDither } from "../../hooks/useThreeDither";
import s from "./VideoPlayer.module.scss";

type DitherMode = "bayer" | "floyd" | "dots" | "ascii";

const ACCEPTED_TYPES = ["video/mp4", "video/webm"];

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const MODE_OPTIONS = [
  { value: "bayer" as DitherMode, label: "Bayer" },
  { value: "floyd" as DitherMode, label: "Floyd" },
  { value: "dots" as DitherMode, label: "Halftone" },
  { value: "ascii" as DitherMode, label: "ASCII" },
];

const RESOLUTION_OPTIONS = [
  { value: "256", label: "256" },
  { value: "320", label: "320" },
  { value: "480", label: "480" },
];

const MATRIX_OPTIONS = [
  { value: "2", label: "2×2" },
  { value: "4", label: "4×4" },
  { value: "8", label: "8×8" },
];

interface VideoPlayerProps {
  windowId: string;
  fileUrl?: string;
}

export const VideoPlayer = memo(function VideoPlayer({
  windowId,
  fileUrl,
}: VideoPlayerProps) {
  void windowId;
  const [fileName, setFileName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [loop, setLoop] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [ditherMode, setDitherMode] = useState<DitherMode>("bayer");
  const [resolution, setResolution] = useState("320");
  const [matrixSize, setMatrixSize] = useState<"2" | "4" | "8">("4");
  const [invert, setInvert] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const displayRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const palette = invert
    ? ["#ffffff", "#000000"]
    : ["#000000", "#ffffff"];

  useThreeDither(
    canvasRef,
    videoRef,
    {
      mode: ditherMode,
      resolution: Number(resolution),
      palette,
      matrixSize: Number(matrixSize) as 2 | 4 | 8,
    },
  );

  const fitCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !video || !wrap) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return;

    const pw = wrap.clientWidth;
    const ph = wrap.clientHeight;
    if (!pw || !ph) return;

    const aspect = vw / vh;
    let cw = pw;
    let ch = pw / aspect;

    if (ch > ph) {
      ch = ph;
      cw = ch * aspect;
    }

    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
  }, []);

  const loadFromUrl = useCallback(
    (url: string, name: string) => {
      const video = videoRef.current;
      if (!video) return;

      video.muted = false;
      video.src = url;
      video.volume = volume;
      video.loop = loop;
      video.load();



      if (displayRef.current) {
        displayRef.current.src = url;
        displayRef.current.load();
      }

      setFileName(name);
      setVideoUrl(url);
      setCurrentTime(0);
      setIsPlaying(false);
      setIsInitialized(true);
    },
    [loop, volume],
  );

  const loadFile = useCallback(
    (nextFile: File | undefined) => {
      if (!nextFile) return;
      if (
        !ACCEPTED_TYPES.includes(nextFile.type) &&
        !nextFile.name.match(/\.(mp4|webm)$/i)
      )
        return;

      const url = URL.createObjectURL(nextFile);
      loadFromUrl(url, nextFile.name);
    },
    [loadFromUrl],
  );

  const syncDisplay = useCallback(() => {
    const src = videoRef.current;
    const dst = displayRef.current;
    if (!src || !dst) return;
    if (src.paused) {
      dst.pause();
    } else {
      dst.play().catch(() => {});
    }
    if (Math.abs(dst.currentTime - src.currentTime) > 0.3) {
      dst.currentTime = src.currentTime;
    }
  }, []);

  const handlePlayPause = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      await video.play();
    } else {
      video.pause();
    }
  }, []);

  const handleStop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleSeek = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value;
    setCurrentTime(value);
  }, []);

  const handleVolumeChange = useCallback((value: number) => {
    const video = videoRef.current;
    if (video) {
      video.volume = value;
    }
    setVolume(value);
  }, []);

  const handleLoopToggle = useCallback(() => {
    const video = videoRef.current;
    const nextLoop = !loop;
    if (video) {
      video.loop = nextLoop;
    }
    setLoop(nextLoop);
  }, [loop]);

  useEffect(() => {
    if (!fileUrl) return;
    const resolvedUrl = getAssetPath(fileUrl);
    loadFromUrl(resolvedUrl, fileUrl.split("/").pop() ?? "video");
  }, [fileUrl, loadFromUrl]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const droppedFile = event.dataTransfer.files[0];
      if (!droppedFile) return;

      loadFile(droppedFile);
    },
    [loadFile],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(true);
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      loadFile(event.target.files?.[0]);
    },
    [loadFile],
  );

  const handleOpenClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInvertToggle = useCallback(() => {
    setInvert((prev) => !prev);
  }, []);

  const handleShowOriginalToggle = useCallback(() => {
    setShowOriginal((prev) => !prev);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      fitCanvas();
    };

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
    };

    const onPlay = () => {
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [videoUrl, fitCanvas]);

  useEffect(() => {
    if (!showOriginal || !videoUrl) return;

    const src = videoRef.current;
    const dst = displayRef.current;
    if (!src || !dst) return;

    const onTimeUpdate = () => syncDisplay();
    const onPlay = () => syncDisplay();
    const onPause = () => syncDisplay();

    src.addEventListener("timeupdate", onTimeUpdate);
    src.addEventListener("play", onPlay);
    src.addEventListener("pause", onPause);

    return () => {
      src.removeEventListener("timeupdate", onTimeUpdate);
      src.removeEventListener("play", onPlay);
      src.removeEventListener("pause", onPause);
      if (dst) {
        dst.pause();
        dst.src = "";
      }
    };
  }, [showOriginal, videoUrl, syncDisplay]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;
      if (event.code === "Space") {
        event.preventDefault();
        handlePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayPause]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    resizeObserverRef.current = new ResizeObserver(() => {
      fitCanvas();
    });
    resizeObserverRef.current.observe(wrap);

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, [fitCanvas]);

  useEffect(() => {
    const video = videoRef.current;
    const display = displayRef.current;
    return () => {
      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
      if (display) {
        display.pause();
        display.src = "";
        display.load();
      }
    };
  }, []);

  return (
    <div
      className={s.videoPlayer}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={s.dropTarget}>
        <div className={clsx(s.dropOverlay, isDragging && s.visible)}>
          <span className={s.dropText}>Drop video file here</span>
        </div>

        <div className={s.videoArea}>
          <div ref={wrapRef} className={s.canvasWrap}>
            <canvas
              ref={canvasRef}
              className={clsx(s.ditherCanvas, !isInitialized && s.hidden)}
            />

            {!isInitialized && (
              <div className={s.welcomeOverlay}>
                <span className={s.welcomeText}>
                  Load an MP4 or WebM file to start
                </span>
                <MacButton variant="default" onClick={handleOpenClick}>
                  Open
                </MacButton>
              </div>
            )}
          </div>

          {showOriginal && isInitialized && (
            <div className={s.originalWrap}>
              <video
                ref={displayRef}
                src={videoUrl}
                className={s.originalVideo}
                playsInline
              />
            </div>
          )}
        </div>

        {isInitialized && (
          <div className={s.controls}>
            <div className={s.trackInfo}>
              {fileName}
              {duration > 0 && (
                <span className={s.durationInfo}>
                  {" "}
                  &mdash; {formatTime(duration)}
                </span>
              )}
            </div>

            <div className={s.seekRow}>
              <span className={s.timeDisplay}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <MacSlider
                className={s.seekSlider}
                aria-label="Seek"
                value={currentTime}
                min={0}
                max={duration || 1}
                step={0.1}
                commitOnPointerUp
                onChange={handleSeek}
              />
            </div>

            <div className={s.transportRow}>
              <MacButton onClick={handlePlayPause}>
                {isPlaying ? "Pause" : "Play"}
              </MacButton>
              <MacButton onClick={handleStop}>Stop</MacButton>
              <div className={s.secondaryTransportControls}>
                <button
                  className={clsx(s.toggleBtn, loop && s.active)}
                  type="button"
                  onClick={handleLoopToggle}
                >
                  Loop
                </button>
                <MacButton onClick={handleOpenClick}>Open</MacButton>
              </div>
            </div>

            <div className={s.optionsRow}>
              <div className={clsx(s.volumeRow, s.mobileHidden)}>
                <span className={s.optionLabel}>Vol</span>
                <MacSlider
                  className={s.volumeSlider}
                  aria-label="Volume"
                  value={volume}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={handleVolumeChange}
                />
              </div>
              <PopupSelect
                label="Mode:"
                value={ditherMode}
                options={MODE_OPTIONS}
                onChange={setDitherMode}
              />
              <PopupSelect
                label="Res:"
                value={resolution}
                options={RESOLUTION_OPTIONS}
                onChange={(val: string) => setResolution(val)}
              />
              {ditherMode === "bayer" && (
                <PopupSelect
                  label="Matrix:"
                  value={matrixSize}
                  options={MATRIX_OPTIONS}
                  onChange={(val: string) =>
                    setMatrixSize(val as "2" | "4" | "8")
                  }
                />
              )}
              <button
                className={clsx(s.toggleBtn, invert && s.active)}
                type="button"
                onClick={handleInvertToggle}
              >
                Invert
              </button>
              <button
                className={clsx(s.toggleBtn, s.mobileHidden, showOriginal && s.active)}
                type="button"
                onClick={handleShowOriginalToggle}
              >
                Original
              </button>
            </div>
          </div>
        )}
      </div>

      <video
        ref={videoRef}
        className={s.sourceVideo}
        playsInline
      />


      <input
        ref={inputRef}
        className={s.fileInput}
        type="file"
        accept=".mp4,.webm,video/mp4,video/webm"
        onChange={handleFileInputChange}
      />
    </div>
  );
});
