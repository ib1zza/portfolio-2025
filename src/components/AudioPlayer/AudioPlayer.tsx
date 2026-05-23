import clsx from "clsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { MacButton } from "../UIKit/MacButton";
import { MacSlider } from "../UIKit/MacSlider";
import { PopupSelect } from "../UIKit/PopupSelect";
import type { VisualizerMode } from "./visualizers";
import {
  drawPixelBars,
  drawPixelCircle,
  drawPixelWaveform,
} from "./visualizers";
import s from "./AudioPlayer.module.scss";

const ACCEPTED_TYPES = ["audio/mpeg", "audio/ogg", "audio/wav", "audio/mp3"];

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const VISUALIZER_OPTIONS = [
  { value: "bars" as VisualizerMode, label: "Pixel Bars" },
  { value: "waveform" as VisualizerMode, label: "Pixel Waveform" },
  { value: "circle" as VisualizerMode, label: "Pixel Circle" },
];

interface AudioPlayerProps {
  windowId: string;
}

export const AudioPlayer = memo(function AudioPlayer({
  windowId,
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const initAudioContext = useCallback(() => {
    if (audioCtxRef.current) return;

    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
  }, []);

  const connectAudioNode = useCallback(() => {
    const audio = audioRef.current;
    const audioCtx = audioCtxRef.current;
    const analyser = analyserRef.current;
    if (!audio || !audioCtx || !analyser) return;

    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }

    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    sourceRef.current = source;
  }, []);

  const loadFile = useCallback(
    (nextFile: File | undefined) => {
      if (!nextFile) return;
      if (
        !ACCEPTED_TYPES.includes(nextFile.type) &&
        !nextFile.name.match(/\.(mp3|ogg|wav)$/i)
      )
        return;

      const url = URL.createObjectURL(nextFile);
      const audio = new Audio(url);
      audio.volume = volume;
      audio.loop = loop;

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
      setFile(nextFile);
      setFileName(nextFile.name);
      setCurrentTime(0);
      setIsPlaying(false);
      setIsInitialized(true);
    },
    [loop, volume],
  );

  const handlePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioCtxRef.current?.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  }, []);

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
    setVolume(value);
  }, []);

  const handleLoopToggle = useCallback(() => {
    const audio = audioRef.current;
    const nextLoop = !loop;
    if (audio) {
      audio.loop = nextLoop;
    }
    setLoop(nextLoop);
  }, [loop]);

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
    if (!file) return;
    connectAudioNode();
  }, [file, connectAudioNode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);

      const audio = audioRef.current;
      if (!audio || audio.paused) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      if (visualizerMode === "waveform") {
        analyser.getByteTimeDomainData(dataArray);
        drawPixelWaveform(ctx, dataArray, canvas.width, canvas.height);
      } else {
        analyser.getByteFrequencyData(dataArray);
        if (visualizerMode === "circle") {
          drawPixelCircle(ctx, dataArray, canvas.width, canvas.height);
        } else {
          drawPixelBars(ctx, dataArray, canvas.width, canvas.height);
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [visualizerMode]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div
      className={s.audioPlayer}
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
            <span className={s.welcomeTitle}>Audio Player</span>
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
                <MacButton onClick={handleOpenClick}>Open</MacButton>
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
