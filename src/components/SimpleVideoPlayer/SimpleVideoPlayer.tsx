import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { MacButton, MacSlider } from "../UIKit";
import { getAssetPath } from "../../utils/assets";
import { useThreeDither } from "../../hooks/useThreeDither";
import s from "./SimpleVideoPlayer.module.scss";

const DEFAULT_MODE = "bayer";
const DEFAULT_RESOLUTION = 320;
const DEFAULT_MATRIX_SIZE: 2 | 4 | 8 = 4;

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

interface SimpleVideoPlayerProps {
  windowId: string;
  fileUrl?: string;
}

export const SimpleVideoPlayer = memo(function SimpleVideoPlayer({
  windowId,
  fileUrl,
}: SimpleVideoPlayerProps) {
  void windowId;
  const [fileName, setFileName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [loop, setLoop] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const sourceVideoRef = useRef<HTMLVideoElement>(null);
  const ditherCanvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const palette = ["#000000", "#ffffff"];

  useThreeDither(
    ditherCanvasRef,
    sourceVideoRef,
    {
      mode: DEFAULT_MODE,
      resolution: DEFAULT_RESOLUTION,
      palette,
      matrixSize: DEFAULT_MATRIX_SIZE,
    },
  );

  const fitCanvas = useCallback(() => {
    const canvas = ditherCanvasRef.current;
    const video = sourceVideoRef.current;
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

  const loadFromUrl = useCallback((url: string, name: string) => {
    const video = sourceVideoRef.current;
    if (!video) return;

    video.muted = false;
    video.src = url;
    video.volume = 0.8;
    video.loop = false;
    video.load();



    setFileName(name);
    setCurrentTime(0);
    setIsPlaying(false);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!fileUrl) return;
    const resolvedUrl = getAssetPath(fileUrl);
    loadFromUrl(resolvedUrl, fileUrl.split("/").pop() ?? "video");
  }, [fileUrl, loadFromUrl]);

  const handlePlayPause = useCallback(async () => {
    const video = sourceVideoRef.current;
    if (!video) return;

    if (video.paused) {
      await video.play();
    } else {
      video.pause();
    }
  }, []);

  const handleStop = useCallback(() => {
    const video = sourceVideoRef.current;
    if (!video) return;

    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleSeek = useCallback((value: number) => {
    const video = sourceVideoRef.current;
    if (!video) return;

    video.currentTime = value;
    setCurrentTime(value);
  }, []);

  const handleVolumeChange = useCallback((value: number) => {
    const video = sourceVideoRef.current;
    if (video) {
      video.volume = value;
    }
    setVolume(value);
  }, []);

  const handleLoopToggle = useCallback(() => {
    const video = sourceVideoRef.current;
    const nextLoop = !loop;
    if (video) {
      video.loop = nextLoop;
    }
    setLoop(nextLoop);
  }, [loop]);

  useEffect(() => {
    const video = sourceVideoRef.current;
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
  }, [fitCanvas]);

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
    const video = sourceVideoRef.current;
    return () => {
      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
    };
  }, []);

  return (
    <div className={s.videoPlayer}>
      <div className={s.videoArea}>
        <div ref={wrapRef} className={s.videoWrap}>
          <canvas
            ref={ditherCanvasRef}
            className={clsx(s.ditherCanvas, isLoaded && s.visible)}
          />

          {!isLoaded && (
            <div className={s.loadingOverlay}>
              <span className={s.loadingText}>Loading...</span>
            </div>
          )}
        </div>
      </div>

      {isLoaded && (
        <div className={s.controls}>
          <div className={s.trackInfo}>{fileName}</div>

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
            <button
              className={clsx(s.loopBtn, loop && s.active)}
              type="button"
              onClick={handleLoopToggle}
            >
              Loop
            </button>
          </div>

          <div className={s.volumeRow}>
            <span className={s.volumeLabel}>Vol</span>
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
        </div>
      )}

      <video
        ref={sourceVideoRef}
        className={s.sourceVideo}
        playsInline
      />

    </div>
  );
});
