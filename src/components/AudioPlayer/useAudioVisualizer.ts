import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { VisualizerMode } from "./visualizers";
import {
  drawPixelBars,
  drawPixelCircle,
  drawPixelWaveform,
} from "./visualizers";
import { VISUALIZER_FRAME_MS } from "./constants";

export const useAudioVisualizer = (
  audioRef: RefObject<HTMLAudioElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  visualizerMode: VisualizerMode,
  isInitialized: boolean,
  file: File | null,
  fileUrl: string | undefined,
) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const initAudioContext = useCallback(() => {
    if (audioCtxRef.current) return;

    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const analyser = audioCtx.createAnalyser();

    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.82;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;

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
  }, [audioRef]);

  const ensureAudioContext = useCallback(() => {
    if (audioCtxRef.current) return;

    initAudioContext();
    if (audioRef.current) {
      connectAudioNode();
    }
  }, [initAudioContext, connectAudioNode, audioRef]);

  useEffect(() => {
    if (isInitialized && audioCtxRef.current) {
      connectAudioNode();
    }
  }, [isInitialized, connectAudioNode]);

  useEffect(() => {
    if (!isInitialized) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastDrawAt = 0;
    let wasPaused = false;
    let frequencyData: Uint8Array<ArrayBuffer> | null = null;
    let waveformData: Uint8Array<ArrayBuffer> | null = null;

    const clear = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const draw = (time: number) => {
      animFrameRef.current = requestAnimationFrame(draw);

      const audio = audioRef.current;
      const analyser = analyserRef.current;

      if (!audio || audio.paused || !analyser) {
        if (!wasPaused) {
          clear();
          wasPaused = true;
        }

        return;
      }

      wasPaused = false;

      if (time - lastDrawAt < VISUALIZER_FRAME_MS) {
        return;
      }

      lastDrawAt = time;

      if (!frequencyData) {
        frequencyData = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
      }
      if (!waveformData) {
        waveformData = new Uint8Array(analyser.fftSize) as Uint8Array<ArrayBuffer>;
      }

      if (visualizerMode === "waveform") {
        analyser.getByteTimeDomainData(waveformData);
        drawPixelWaveform(ctx, waveformData, canvas.width, canvas.height);
        return;
      }

      analyser.getByteFrequencyData(frequencyData);

      if (visualizerMode === "circle") {
        drawPixelCircle(ctx, frequencyData, canvas.width, canvas.height);
        return;
      }

      drawPixelBars(ctx, frequencyData, canvas.width, canvas.height);
    };

    clear();
    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [file, fileUrl, isInitialized, visualizerMode, audioRef, canvasRef]);

  useEffect(() => {
    return () => {
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

  return {
    audioCtxRef,
    initAudioContext,
    ensureAudioContext,
  };
};
