import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { MacButton, MacSlider, PopupSelect } from "../UIKit";
import type { VisualizerMode } from "./visualizers";
import { getAssetPath } from "../../utils/assets";
import s from "./AudioPlayer.module.scss";

import { ACCEPTED_TYPES, VISUALIZER_OPTIONS } from "./constants";
import { formatTime } from "./helpers";
import { useAudioVisualizer } from "./useAudioVisualizer";

interface AudioPlayerProps {
  windowId: string;
  fileUrl?: string;
}

export const AudioPlayer = memo(function AudioPlayer({
  windowId,
  fileUrl,
}: AudioPlayerProps) {
  void windowId;
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [loop, setLoop] = useState(false);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>("bars");
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const volumeRef = useRef(volume);
  const loopRef = useRef(loop);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {
    audioCtxRef,
    initAudioContext,
    ensureAudioContext,
  } = useAudioVisualizer(
    audioRef,
    canvasRef,
    visualizerMode,
    isInitialized,
    file,
    fileUrl,
  );

  const setupAudioElement = useCallback(
    (audio: HTMLAudioElement, trackName: string) => {
      audio.volume = volumeRef.current;
      audio.loop = loopRef.current;

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
      });

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
      });

      audio.addEventListener("play", () => {
        setIsPlaying(true);
      });

      audio.addEventListener("pause", () => {
        setIsPlaying(false);
      });

      if (audioRef.current) {
        audioRef.current.src = "";
        audioRef.current.load();
      }

      audioRef.current = audio;
      setFileName(trackName);
      setCurrentTime(0);
      setIsPlaying(false);
      setIsInitialized(true);
    },
    [],
  );

  const loadFromUrl = useCallback(
    (url: string, name: string) => {
      const audio = new Audio(url);
      setupAudioElement(audio, name);
    },
    [setupAudioElement],
  );

  const loadFile = useCallback(
    (nextFile: File | undefined) => {
      if (!nextFile) return;
      if (
        !ACCEPTED_TYPES.includes(nextFile.type) &&
        !nextFile.name.match(/\.(mp3|ogg|wav)$/i)
      )
        return;

      const url = URL.createObjectURL(nextFile);
      setFile(nextFile);
      loadFromUrl(url, nextFile.name);
    },
    [loadFromUrl],
  );

  const handlePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    ensureAudioContext();

    if (audioCtxRef.current?.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  }, [ensureAudioContext, audioCtxRef]);

  const handleStop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleSeek = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = value;
    setCurrentTime(value);
  }, []);

  const handleVolumeChange = useCallback((value: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = value;
    }
    volumeRef.current = value;
    setVolume(value);
  }, []);

  const handleLoopToggle = useCallback(() => {
    const audio = audioRef.current;
    const nextLoop = !loop;
    if (audio) {
      audio.loop = nextLoop;
    }
    loopRef.current = nextLoop;
    setLoop(nextLoop);
  }, [loop]);

  useEffect(() => {
    if (!fileUrl) return;
    const resolvedUrl = getAssetPath(fileUrl);
    loadFromUrl(resolvedUrl, fileUrl.split("/").pop() ?? "audio");
  }, [fileUrl, loadFromUrl]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const droppedFile = event.dataTransfer.files[0];
      if (!droppedFile) return;

      initAudioContext();
      loadFile(droppedFile);
    },
    [initAudioContext, loadFile],
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
      initAudioContext();
      loadFile(event.target.files?.[0]);
    },
    [initAudioContext, loadFile],
  );

  const handleOpenClick = useCallback(() => {
    initAudioContext();
    inputRef.current?.click();
  }, [initAudioContext]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  return (
    <div
      className={clsx(s.audioPlayer, isDragging && s.dragging)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={s.dropTarget}>
        <div className={clsx(s.dropOverlay, isDragging && s.visible)}>
          <span className={s.dropText}>Drop audio file here</span>
        </div>

        {!isInitialized ? (
          <div className={s.welcomeScreen}>
            <span className={s.welcomeText}>
              Load an MP3, OGG, or WAV file to start
            </span>
            <MacButton variant="default" onClick={handleOpenClick}>
              Open
            </MacButton>
          </div>
        ) : (
          <>
            <div className={s.visualizerWrap}>
              <canvas
                ref={canvasRef}
                className={s.canvas}
                width={512}
                height={256}
              />

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
                  orientation="vertical"
                />
              </div>
            </div>

            <div className={s.visualizerRow}>
              <PopupSelect
                label="Mode:"
                value={visualizerMode}
                options={VISUALIZER_OPTIONS}
                onChange={setVisualizerMode}
                stackedOnMobile
              />
            </div>

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
                <div className={s.secondaryTransportControls}>
                  <button
                    className={clsx(s.loopBtn, loop && s.active)}
                    type="button"
                    onClick={handleLoopToggle}
                  >
                    Loop
                  </button>
                  <MacButton onClick={handleOpenClick}>Open</MacButton>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        className={s.fileInput}
        type="file"
        accept=".mp3,.ogg,.wav,audio/mpeg,audio/ogg,audio/wav"
        onChange={handleFileInputChange}
      />
    </div>
  );
});
