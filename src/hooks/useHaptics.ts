// src/hooks/useWebHapticsEffects.ts
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useWebHaptics } from "web-haptics/react";

type WebHapticEasterEgg =
  | "happyMac"
  | "startupChime"
  | "sadMac"
  | "finderClick"
  | "systemBomb"
  | "sos"
  | "bootSequence";

interface UseWebHapticsEffectsOptions {
  playOnMount?: boolean;
  startupDelayMs?: number;
  disabled?: boolean;
  debug?: boolean;
  showSwitch?: boolean;
  defaultIntensity?: number;
  throttleMs?: number;
}

type WebHapticsPatternStep = {
  duration: number;
  delay?: number;
  intensity?: number;
};

type WebHapticsPreset = {
  pattern: WebHapticsPatternStep[];
  description: string;
};

const clampIntensity = (value: number) => Math.min(1, Math.max(0, value));

export const useHaptics = (options: UseWebHapticsEffectsOptions = {}) => {
  const {
    playOnMount = false,
    startupDelayMs = 450,
    disabled = false,
    debug = false,
    showSwitch = false,
    defaultIntensity = 0.55,
    throttleMs = 60,
  } = options;

  const { trigger, cancel } = useWebHaptics({
    debug,
    showSwitch,
  });

  const lastPlayedAtRef = useRef(0);

  const canPlay = useCallback(() => {
    if (disabled) return false;
    if (typeof window === "undefined") return false;

    const now = Date.now();

    if (now - lastPlayedAtRef.current < throttleMs) {
      return false;
    }

    lastPlayedAtRef.current = now;
    return true;
  }, [disabled, throttleMs]);

  const play = useCallback(
    async (
      input:
        | "success"
        | "nudge"
        | "error"
        | "buzz"
        | number
        | number[]
        | WebHapticsPatternStep[]
        | WebHapticsPreset,
      intensity = defaultIntensity,
    ) => {
      if (!canPlay()) return;

      await trigger(input, {
        intensity: clampIntensity(intensity),
      });
    },
    [canPlay, defaultIntensity, trigger],
  );

  /**
   * 1. Завершение загрузки сайта.
   * Короткий мягкий success.
   */
  const siteLoaded = useCallback(async () => {
    await play(
      {
        description: "Site loaded",
        pattern: [
          { duration: 35, intensity: 0.35 },
          { delay: 55, duration: 45, intensity: 0.65 },
        ],
      },
      0.55,
    );
  }, [play]);

  /**
   * 2. Открытие файла.
   */
  const fileOpen = useCallback(async () => {
    await play([{ duration: 35, intensity: 0.45 }], 0.45);
  }, [play]);

  /**
   * 2. Закрытие файла.
   */
  const fileClose = useCallback(async () => {
    await play([{ duration: 25, intensity: 0.3 }], 0.35);
  }, [play]);

  /**
   * 2. Открытие папки.
   * Чуть более выразительно, чем файл.
   */
  const folderOpen = useCallback(async () => {
    await play(
      [
        { duration: 35, intensity: 0.35 },
        { delay: 35, duration: 55, intensity: 0.65 },
      ],
      0.6,
    );
  }, [play]);

  /**
   * 2. Закрытие папки.
   */
  const folderClose = useCallback(async () => {
    await play(
      [
        { duration: 45, intensity: 0.45 },
        { delay: 45, duration: 25, intensity: 0.25 },
      ],
      0.45,
    );
  }, [play]);

  /**
   * Обычный UI click.
   */
  const uiClick = useCallback(async () => {
    await play("nudge", 0.35);
  }, [play]);

  /**
   * Drag & drop.
   */
  const dragStart = useCallback(async () => {
    await play([{ duration: 45, intensity: 0.45 }], 0.45);
  }, [play]);

  const dragEnd = useCallback(async () => {
    await play(
      [
        { duration: 25, intensity: 0.3 },
        { delay: 40, duration: 35, intensity: 0.55 },
      ],
      0.55,
    );
  }, [play]);

  /**
   * Built-in эффекты из web-haptics.
   */
  const success = useCallback(async () => {
    await play("success", 0.6);
  }, [play]);

  const nudge = useCallback(async () => {
    await play("nudge", 0.6);
  }, [play]);

  const error = useCallback(async () => {
    await play("error", 0.75);
  }, [play]);

  const buzz = useCallback(async () => {
    await play("buzz", 0.45);
  }, [play]);

  /**
   * Простые кастомные эффекты.
   */
  const softTap = useCallback(async () => {
    await play(25, 0.25);
  }, [play]);

  const hardTap = useCallback(async () => {
    await play(70, 0.85);
  }, [play]);

  const doubleTap = useCallback(async () => {
    await play([35, 45, 35], 0.55);
  }, [play]);

  const tripleTap = useCallback(async () => {
    await play([30, 40, 30, 40, 30], 0.65);
  }, [play]);

  const easterEgg = useCallback(
    async (type: WebHapticEasterEgg = "startupChime") => {
      if (type === "happyMac") {
        await play(
          {
            description: "Happy Mac",
            pattern: [
              { duration: 25, intensity: 0.25 },
              { delay: 45, duration: 35, intensity: 0.45 },
              { delay: 55, duration: 55, intensity: 0.7 },
              { delay: 70, duration: 35, intensity: 0.35 },
            ],
          },
          0.65,
        );
        return;
      }

      if (type === "startupChime") {
        await play(
          {
            description: "Mac-like startup chime",
            pattern: [
              { duration: 30, intensity: 0.25 },
              { delay: 70, duration: 45, intensity: 0.45 },
              { delay: 85, duration: 70, intensity: 0.75 },
              { delay: 120, duration: 100, intensity: 1 },
              { delay: 160, duration: 45, intensity: 0.35 },
            ],
          },
          0.8,
        );
        return;
      }

      if (type === "sadMac") {
        await play(
          {
            description: "Sad Mac",
            pattern: [
              { duration: 90, intensity: 0.9 },
              { delay: 90, duration: 70, intensity: 0.65 },
              { delay: 90, duration: 45, intensity: 0.4 },
              { delay: 130, duration: 120, intensity: 1 },
            ],
          },
          0.85,
        );
        return;
      }

      if (type === "finderClick") {
        await play(
          {
            description: "Finder double click",
            pattern: [
              { duration: 22, intensity: 0.35 },
              { delay: 42, duration: 22, intensity: 0.35 },
              { delay: 70, duration: 40, intensity: 0.55 },
            ],
          },
          0.5,
        );
        return;
      }

      if (type === "systemBomb") {
        await play(
          {
            description: "Classic system bomb",
            pattern: [
              { duration: 55, intensity: 0.7 },
              { delay: 45, duration: 55, intensity: 0.7 },
              { delay: 90, duration: 130, intensity: 1 },
              { delay: 120, duration: 45, intensity: 0.45 },
              { delay: 45, duration: 45, intensity: 0.45 },
            ],
          },
          0.9,
        );
        return;
      }

      if (type === "sos") {
        await play(
          {
            description: "SOS",
            pattern: [
              { duration: 35, intensity: 0.6 },
              { delay: 45, duration: 35, intensity: 0.6 },
              { delay: 45, duration: 35, intensity: 0.6 },

              { delay: 100, duration: 100, intensity: 0.9 },
              { delay: 65, duration: 100, intensity: 0.9 },
              { delay: 65, duration: 100, intensity: 0.9 },

              { delay: 100, duration: 35, intensity: 0.6 },
              { delay: 45, duration: 35, intensity: 0.6 },
              { delay: 45, duration: 35, intensity: 0.6 },
            ],
          },
          0.8,
        );
        return;
      }

      if (type === "bootSequence") {
        await play(
          {
            description: "Retro boot sequence",
            pattern: [
              { duration: 20, intensity: 0.2 },
              { delay: 80, duration: 20, intensity: 0.25 },
              { delay: 80, duration: 25, intensity: 0.35 },
              { delay: 90, duration: 35, intensity: 0.45 },
              { delay: 110, duration: 70, intensity: 0.8 },
              { delay: 180, duration: 40, intensity: 0.35 },
              { delay: 55, duration: 40, intensity: 0.6 },
            ],
          },
          0.75,
        );
      }
    },
    [play],
  );

  useEffect(() => {
    if (!playOnMount || disabled) return;

    const timeoutId = window.setTimeout(() => {
      void siteLoaded();
    }, startupDelayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [disabled, playOnMount, siteLoaded, startupDelayMs]);

  return useMemo(
    () => ({
      siteLoaded,

      fileOpen,
      fileClose,

      folderOpen,
      folderClose,

      uiClick,
      dragStart,
      dragEnd,

      success,
      nudge,
      error,
      buzz,

      softTap,
      hardTap,
      doubleTap,
      tripleTap,

      easterEgg,

      cancel,
      play,
    }),
    [
      siteLoaded,
      fileOpen,
      fileClose,
      folderOpen,
      folderClose,
      uiClick,
      dragStart,
      dragEnd,
      success,
      nudge,
      error,
      buzz,
      softTap,
      hardTap,
      doubleTap,
      tripleTap,
      easterEgg,
      cancel,
      play,
    ],
  );
};
